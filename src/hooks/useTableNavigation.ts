import { useRef, useState, useEffect, useCallback } from 'react';
import type { NavigationConfig, CellPosition, SelectionRange, CellRefArray } from '../types/navigation';

export function useTableNavigation(config: NavigationConfig) {
  const { rows, cols, wrapAround = false, isActive = true, onClearCells, onSelectionChange, getMergeInfo, shouldSkipRow } = config;

  // ref 배열 즉시 초기화
  const cellRefs = useRef<CellRefArray>(
    Array(rows).fill(null).map(() => Array(cols).fill(null))
  );
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<CellPosition | null>(null);

  // ref 배열 업데이트 (rows/cols 변경 시)
  useEffect(() => {
    const newRefs = Array(rows).fill(null).map((_, rowIndex) => {
      return Array(cols).fill(null).map((_, colIndex) => {
        return cellRefs.current[rowIndex]?.[colIndex] || null;
      });
    });
    cellRefs.current = newRefs;
  }, [rows, cols]);

  // 전역 mouseup 이벤트 리스너 (컴포넌트 외부로 드래그 시 처리)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting]);

  // rows/cols 변경 시 드래그 상태 초기화
  useEffect(() => {
    setIsSelecting(false);
    setDragStartCell(null);
    setSelectedRange(null);
  }, [rows, cols]);

  // selectedRange 변경 시 콜백 호출
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  // 셀에 포커스 이동
  const focusCell = useCallback((row: number, col: number) => {
    const cell = cellRefs.current[row]?.[col];
    if (cell) {
      cell.focus();
      setFocusedCell({ row, col });
    }
  }, []);

  // 선택 영역 초기화
  const clearSelection = useCallback(() => {
    setSelectedRange(null);
    setDragStartCell(null);
  }, []);

  // 편집 모드 진입
  const enterEditMode = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
    const cell = cellRefs.current[row]?.[col];
    if (cell) {
      // readOnly를 제거하고 포커스
      setTimeout(() => {
        cell.focus();
        // 텍스트 끝으로 커서 이동
        if (cell instanceof HTMLInputElement || cell instanceof HTMLTextAreaElement) {
          cell.setSelectionRange(cell.value.length, cell.value.length);
        }
      }, 0);
    }
  }, []);

  // 편집 모드 종료
  const exitEditMode = useCallback(() => {
    setEditingCell(null);
  }, []);

  // 방향키로 셀 이동
  const moveCell = useCallback((currentRow: number, currentCol: number, deltaRow: number, deltaCol: number) => {
    let newRow = currentRow + deltaRow;
    let newCol = currentCol + deltaCol;

    // 경계 체크
    if (wrapAround) {
      if (newRow < 0) newRow = rows - 1;
      if (newRow >= rows) newRow = 0;
      if (newCol < 0) newCol = cols - 1;
      if (newCol >= cols) newCol = 0;
    } else {
      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        return;
      }
    }

    // null인 셀 건너뛰기
    let attempts = 0;
    const maxAttempts = rows * cols;
    while (cellRefs.current[newRow]?.[newCol] === null && attempts < maxAttempts) {
      newRow += deltaRow;
      newCol += deltaCol;

      if (wrapAround) {
        if (newRow < 0) newRow = rows - 1;
        if (newRow >= rows) newRow = 0;
        if (newCol < 0) newCol = cols - 1;
        if (newCol >= cols) newCol = 0;
      } else {
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
          return;
        }
      }
      attempts++;
    }

    if (attempts >= maxAttempts) return;

    // 병합셀 처리
    if (getMergeInfo) {
      const mergeInfo = getMergeInfo(newRow, newCol);
      if (mergeInfo.isMerged && !mergeInfo.isMainCell) {
        // 자식 셀에 도착한 경우
        if (deltaRow !== 0) {
          // 위아래 이동: 병합셀을 건너뛰기
          if (deltaRow > 0) {
            // 아래로 이동: 병합셀의 끝 다음으로
            newRow = mergeInfo.mainRow + mergeInfo.rowspan;
            if (newRow >= rows) return; // 경계 초과
          } else {
            // 위로 이동: 병합셀의 시작으로
            newRow = mergeInfo.mainRow;
          }
        } else {
          // 좌우 이동: 메인 셀로 포커스
          newRow = mergeInfo.mainRow;
        }
      }
    }

    // 건너뛸 행 체크 (예: 선생님 이름 행)
    if (shouldSkipRow && shouldSkipRow(newRow)) {
      // 같은 방향으로 계속 이동
      if (deltaRow !== 0) {
        newRow += deltaRow;
        if (newRow < 0 || newRow >= rows) return; // 경계 초과
      } else {
        // 좌우 이동 시에는 건너뛰지 않음 (현재 행 유지)
        return;
      }
    }

    focusCell(newRow, newCol);

    // 단일 셀 선택 설정 (방향키 이동 후에도 병합 버튼이 작동하도록)
    // 병합셀에 도착한 경우 전체 범위 선택
    let endRow = newRow;
    if (getMergeInfo) {
      const mergeInfo = getMergeInfo(newRow, newCol);
      if (mergeInfo.isMerged) {
        endRow = mergeInfo.mainRow + mergeInfo.rowspan - 1;
      }
    }

    setSelectedRange({
      start: { row: newRow, col: newCol },
      end: { row: endRow, col: newCol }
    });
  }, [rows, cols, wrapAround, focusCell, getMergeInfo, shouldSkipRow]);

  // Ctrl+방향키로 끝 셀로 이동
  const moveToEnd = useCallback((currentRow: number, currentCol: number, deltaRow: number, deltaCol: number) => {
    let newRow = currentRow;
    let newCol = currentCol;
    let lastValidRow = currentRow;
    let lastValidCol = currentCol;

    while (true) {
      newRow += deltaRow;
      newCol += deltaCol;

      // 경계 체크
      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        break;
      }

      // 건너뛸 행 체크 (예: 선생님 이름 행)
      if (shouldSkipRow && shouldSkipRow(newRow)) {
        // 같은 방향으로 계속 이동
        if (deltaRow !== 0) {
          continue; // 다음 행으로 계속
        } else {
          // 좌우 이동 시에는 건너뛰지 않음
          break;
        }
      }

      const cell = cellRefs.current[newRow]?.[newCol];
      if (!cell) break;

      // 텍스트가 있는 셀을 만나면 멈춤
      const value = cell.value || '';
      if (value.trim() !== '') {
        lastValidRow = newRow;
        lastValidCol = newCol;
        break;
      }

      lastValidRow = newRow;
      lastValidCol = newCol;
    }

    focusCell(lastValidRow, lastValidCol);

    // 단일 셀 선택 설정
    setSelectedRange({
      start: { row: lastValidRow, col: lastValidCol },
      end: { row: lastValidRow, col: lastValidCol }
    });
  }, [rows, cols, focusCell, shouldSkipRow]);

  // Shift+방향키로 선택 영역 확장
  const extendSelection = useCallback((currentRow: number, currentCol: number, deltaRow: number, deltaCol: number) => {
    // 새로운 끝점 계산
    let newRow = currentRow + deltaRow;
    let newCol = currentCol + deltaCol;

    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
      return;
    }

    // 병합셀 처리
    if (getMergeInfo) {
      const mergeInfo = getMergeInfo(newRow, newCol);
      if (mergeInfo.isMerged && !mergeInfo.isMainCell) {
        // 자식 셀에 도착한 경우
        if (deltaRow !== 0) {
          // 위아래 이동: 병합셀을 건너뛰기
          if (deltaRow > 0) {
            // 아래로 이동: 병합셀의 끝 다음으로
            newRow = mergeInfo.mainRow + mergeInfo.rowspan;
            if (newRow >= rows) return; // 경계 초과
          } else {
            // 위로 이동: 병합셀의 시작으로
            newRow = mergeInfo.mainRow;
          }
        } else {
          // 좌우 이동: 메인 셀로
          newRow = mergeInfo.mainRow;
        }
      }
    }

    // 건너뛸 행 체크 (예: 선생님 이름 행)
    if (shouldSkipRow && shouldSkipRow(newRow)) {
      // 같은 방향으로 계속 이동
      if (deltaRow !== 0) {
        newRow += deltaRow;
        if (newRow < 0 || newRow >= rows) return; // 경계 초과
      } else {
        // 좌우 이동 시에는 건너뛰지 않음 (현재 행 유지)
        return;
      }
    }

    // 선택 시작점 설정 (처음 누르는 경우)
    if (!selectedRange) {
      setSelectedRange({
        start: { row: currentRow, col: currentCol },
        end: { row: newRow, col: newCol }
      });
      focusCell(newRow, newCol);
      return;
    }

    // 선택 범위 확장
    setSelectedRange({
      start: selectedRange.start,
      end: { row: newRow, col: newCol }
    });

    focusCell(newRow, newCol);
  }, [rows, cols, selectedRange, focusCell, getMergeInfo, shouldSkipRow]);

  // 마우스 다운 - 드래그 시작
  const handleMouseDown = useCallback((row: number, col: number) => {
    // 편집 모드 중에는 드래그 비활성화
    if (editingCell && editingCell.row === row && editingCell.col === col) {
      return;
    }

    // 병합셀 클릭 시 전체 범위 선택
    let startRow = row;
    let endRow = row;

    if (getMergeInfo) {
      const mergeInfo = getMergeInfo(row, col);
      if (mergeInfo.isMerged) {
        startRow = mergeInfo.mainRow;
        endRow = mergeInfo.mainRow + mergeInfo.rowspan - 1;
      }
    }

    setIsSelecting(true);
    setDragStartCell({ row: startRow, col });
    setSelectedRange({
      start: { row: startRow, col },
      end: { row: endRow, col }
    });
    focusCell(startRow, col);
  }, [editingCell, focusCell, getMergeInfo]);

  // 마우스 엔터 - 드래그 중 범위 확장
  const handleMouseEnter = useCallback((row: number, col: number) => {
    // 드래그 중이 아니면 무시
    if (!isSelecting || !dragStartCell) {
      return;
    }

    // 선택 범위 업데이트
    setSelectedRange({
      start: dragStartCell,
      end: { row, col }
    });

    // 포커스도 함께 이동 (선택의 끝점)
    focusCell(row, col);
  }, [isSelecting, dragStartCell, focusCell]);

  // 마우스 업 - 드래그 종료
  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  }, [isSelecting]);

  // 통합 키보드 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    const { key, ctrlKey, shiftKey } = e;
    const isEditing = editingCell && editingCell.row === row && editingCell.col === col;

    // Enter 키 처리
    if (key === 'Enter') {
      e.preventDefault();
      if (isEditing) {
        // 편집 모드 종료
        exitEditMode();
        focusCell(row, col);
      } else {
        // 한 칸 아래로 이동
        moveCell(row, col, 1, 0);
      }
      return;
    }

    // Tab 키 처리
    if (key === 'Tab') {
      e.preventDefault();
      if (isEditing) {
        // 편집 모드 종료
        exitEditMode();
        focusCell(row, col);
      } else {
        // 한 칸 오른쪽으로 이동
        moveCell(row, col, 0, 1);
      }
      return;
    }

    // F2 키로 편집 모드 진입
    if (key === 'F2') {
      if (!isEditing) {
        e.preventDefault();
        enterEditMode(row, col);
      }
      return;
    }

    // Delete 키로 선택된 셀들의 내용 지우기 (편집 모드가 아닐 때만)
    if (key === 'Delete' && !isEditing) {
      e.preventDefault();

      if (onClearCells) {
        const cellsToClear: CellPosition[] = [];

        if (selectedRange) {
          // 선택 범위가 있으면 모든 셀 추가
          const { start, end } = selectedRange;
          const minRow = Math.min(start.row, end.row);
          const maxRow = Math.max(start.row, end.row);
          const minCol = Math.min(start.col, end.col);
          const maxCol = Math.max(start.col, end.col);

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              cellsToClear.push({ row: r, col: c });
            }
          }
        } else {
          // 선택 범위가 없으면 현재 포커스된 셀만
          cellsToClear.push({ row, col });
        }

        onClearCells(cellsToClear);
      }
      return;
    }

    // 편집 모드일 때
    if (isEditing) {
      // Escape로 편집 모드 종료
      if (key === 'Escape') {
        e.preventDefault();
        exitEditMode();
        focusCell(row, col);
      }
      return;
    }

    // 방향키 네비게이션 (편집 모드가 아닐 때만)
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
      e.preventDefault();

      const direction = {
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 }
      }[key]!;

      if (ctrlKey) {
        moveToEnd(row, col, direction.row, direction.col);
      } else if (shiftKey) {
        extendSelection(row, col, direction.row, direction.col);
      } else {
        moveCell(row, col, direction.row, direction.col);
      }
    }
  }, [moveCell, moveToEnd, extendSelection, editingCell, enterEditMode, exitEditMode, focusCell]);

  // 셀 스타일 계산
  const getCellStyle = useCallback((row: number, col: number): React.CSSProperties => {
    // 테이블이 활성화되지 않았으면 스타일 적용 안 함
    if (!isActive) {
      return {};
    }

    let style: React.CSSProperties = {};

    // 선택 영역 스타일
    if (selectedRange) {
      const { start, end } = selectedRange;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        style.backgroundColor = '#dbeafe'; // 연한 파란색
      }
    }

    // 포커스된 셀 스타일 (우선순위 높음)
    if (focusedCell?.row === row && focusedCell?.col === col) {
      style.outline = '2px solid #3b82f6';
      style.outlineOffset = '-2px';
      style.backgroundColor = '#eff6ff';
    }

    return style;
  }, [focusedCell, selectedRange, isActive]);

  return {
    cellRefs,
    focusedCell,
    selectedRange,
    editingCell,
    isSelecting,
    handleKeyDown,
    focusCell,
    clearSelection,
    getCellStyle,
    enterEditMode,
    exitEditMode,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp
  };
}
