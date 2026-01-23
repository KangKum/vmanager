import { useState, useRef, useEffect } from "react";
import type { DayOfWeek, ScheduleCell } from "../util/interfaces";
import { useTableNavigation } from "../hooks/useTableNavigation";

interface TeacherColProps {
  teacherId: number;
  day: DayOfWeek;
  teacherMode: boolean;
  timeRows: number;
  teacherName: string;
  colIndex: number;
  navigation: ReturnType<typeof useTableNavigation>;
  schedules: ScheduleCell[];
  onUpdateName: (name: string) => void;
  onDelete: () => void;
  onUpdateCell: (timeSlot: number, content: string) => void;
}

const TeacherCol = ({
  teacherId,
  day,
  teacherMode,
  timeRows,
  teacherName,
  colIndex,
  navigation,
  schedules,
  onUpdateName,
  onDelete,
  onUpdateCell,
}: TeacherColProps) => {
  const [columnWidth, setColumnWidth] = useState(104); // w-26 = 104px
  const measureRef = useRef<HTMLSpanElement>(null);
  // 병합 정보 조회 함수
  const getCellData = (timeSlot: number) => {
    const cell = schedules.find((c) => c.teacherId === teacherId && c.day === day && c.timeSlot === timeSlot);

    return {
      content: cell?.content || "",
      rowspan: cell?.rowspan || 1,
      isMergedChild: cell?.isMergedChild || false,
    };
  };

  // textarea 특수 처리 핸들러
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, row: number, col: number) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, value } = target;
    const { key } = e;

    const isEditing = navigation.editingCell && navigation.editingCell.row === row && navigation.editingCell.col === col;

    // Alt+Enter: 줄바꿈 허용 (네비게이션 차단)
    if (e.altKey && key === "Enter") {
      // 기본 동작 허용 (줄바꿈)
      return;
    }

    // 편집 모드가 아닐 때는 방향키를 항상 네비게이션으로 처리
    if (!isEditing) {
      if (key === "ArrowUp" || key === "ArrowDown") {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === "ArrowLeft" || key === "ArrowRight") {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      // Delete 키 (편집 모드가 아닐 때만)
      if (key === "Delete") {
        navigation.handleKeyDown(e, row, col);
        return;
      }
    } else {
      // 편집 모드일 때는 상하는 항상 네비게이션, 좌우는 커서가 끝에 있을 때만
      if (key === "ArrowUp" || key === "ArrowDown") {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === "ArrowLeft" && selectionStart === 0) {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === "ArrowRight" && selectionStart === value.length) {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }
    }

    // Enter, Tab, F2, Escape 처리
    if (["Enter", "Tab", "F2", "Escape"].includes(key)) {
      navigation.handleKeyDown(e, row, col);
    }
  };

  const isNameEditing = navigation.editingCell?.row === 0 && navigation.editingCell?.col === colIndex;

  // 선생님 이름 셀 키다운 핸들러 (shift+방향키 블록 선택 방지)
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // shift+방향키는 차단
    if (e.shiftKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      return;
    }
    // 나머지는 일반 핸들러로
    navigation.handleKeyDown(e, 0, colIndex);
  };

  // 선생님 이름 셀 마우스다운 핸들러 (드래그 블록 선택 방지)
  const handleNameMouseDown = () => {
    // 편집 모드가 아니면 블록 선택 방지 (포커스만 이동)
    if (!isNameEditing) {
      navigation.focusCell(0, colIndex);
      return;
    }
    // 편집 모드면 일반 동작
    navigation.handleMouseDown(0, colIndex);
  };

  // 텍스트 너비 측정 함수
  const measureTextWidth = (text: string): number => {
    if (!measureRef.current) return 104;
    measureRef.current.textContent = text || 'placeholder';
    return measureRef.current.offsetWidth + 16; // padding 포함
  };

  // 열의 최대 너비 계산
  const calculateColumnWidth = () => {
    const minWidth = 104; // w-26
    let maxWidth = minWidth;

    // 선생님 이름 너비
    const nameWidth = measureTextWidth(teacherName);
    maxWidth = Math.max(maxWidth, nameWidth);

    // 모든 셀의 내용 확인
    for (let i = 0; i < timeRows; i++) {
      const cellData = getCellData(i);
      if (cellData.content) {
        const contentWidth = measureTextWidth(cellData.content);
        maxWidth = Math.max(maxWidth, contentWidth);
      }
    }

    setColumnWidth(maxWidth);
  };

  // 데이터 변경 시 너비 재계산
  useEffect(() => {
    calculateColumnWidth();
  }, [teacherName, schedules, timeRows]);

  return (
    <>
      {/* 텍스트 너비 측정용 hidden span */}
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
      />

      <div className="teacherColumn" style={{ width: `${columnWidth}px` }}>
        <div className="nameDiv border flex h-7" style={{ width: `${columnWidth}px` }}>
        {teacherMode ? (
          <button className="w-full h-full" onClick={onDelete}>
            X
          </button>
        ) : (
          <input
            ref={(el) => {
              if (!navigation.cellRefs.current[0]) {
                navigation.cellRefs.current[0] = [];
              }
              navigation.cellRefs.current[0][colIndex] = el;
            }}
            className="w-full h-full text-center outline-none"
            placeholder="선생님이름"
            value={teacherName}
            readOnly={!isNameEditing}
            onChange={(e) => onUpdateName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onFocus={() => navigation.focusCell(0, colIndex)}
            onDoubleClick={() => navigation.enterEditMode(0, colIndex)}
            onBlur={() => navigation.exitEditMode()}
            onMouseDown={handleNameMouseDown}
            onMouseEnter={() => {}} // 마우스 엔터 시 아무 동작 안 함 (드래그 확장 방지)
            onMouseUp={() => navigation.handleMouseUp()}
            style={{
              ...navigation.getCellStyle(0, colIndex),
              cursor: isNameEditing ? "text" : "default",
              userSelect: navigation.isSelecting ? "none" : "auto",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          />
        )}
      </div>
      {Array.from({ length: timeRows }).map((_, idx) => {
        const cellData = getCellData(idx);

        // 병합된 자식 셀은 렌더링 스킵
        if (cellData.isMergedChild) {
          return null;
        }

        const row = idx + 1;
        const isEditing = navigation.editingCell?.row === row && navigation.editingCell?.col === colIndex;
        const cellHeight = cellData.rowspan * 28; // 28px = h-7

        return (
          <div key={idx} className="border-x border-b text-center" style={{ width: `${columnWidth}px`, height: `${cellHeight}px` }}>
            <textarea
              data-row={row}
              data-col={colIndex}
              ref={(el) => {
                // 메인 셀의 ref 설정
                if (!navigation.cellRefs.current[row]) {
                  navigation.cellRefs.current[row] = [];
                }
                navigation.cellRefs.current[row][colIndex] = el;

                // 병합된 경우 자식 셀 위치에도 같은 ref 설정
                if (cellData.rowspan > 1) {
                  for (let i = 1; i < cellData.rowspan; i++) {
                    const childRow = row + i;
                    if (!navigation.cellRefs.current[childRow]) {
                      navigation.cellRefs.current[childRow] = [];
                    }
                    navigation.cellRefs.current[childRow][colIndex] = el;
                  }
                }

              }}
              className="w-full h-full text-center outline-none resize-none"
              value={cellData.content}
              readOnly={!isEditing}
              onChange={(e) => onUpdateCell(idx, e.target.value)}
              onKeyDown={(e) => handleTextareaKeyDown(e, row, colIndex)}
              onFocus={() => navigation.focusCell(row, colIndex)}
              onDoubleClick={() => navigation.enterEditMode(row, colIndex)}
              onBlur={() => navigation.exitEditMode()}
              onMouseDown={() => navigation.handleMouseDown(row, colIndex)}
              onMouseEnter={() => navigation.handleMouseEnter(row, colIndex)}
              onMouseUp={() => navigation.handleMouseUp()}
              style={{
                ...navigation.getCellStyle(row, colIndex),
                cursor: isEditing ? "text" : "default",
                userSelect: navigation.isSelecting ? "none" : "auto",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
          </div>
        );
      })}
      </div>
    </>
  );
};
export default TeacherCol;
