import { useMemo, useState, useRef, useEffect } from "react";
import { CiSquarePlus } from "react-icons/ci";
import type { Teacher, DayOfWeek, ScheduleCell } from "../util/interfaces";
import { useTableNavigation } from "../hooks/useTableNavigation";

interface TeacherTableProps {
  teacher: Teacher;
  teacherMode: boolean;
  timeMode: boolean;
  timeSettings: {
    startHour: string;
    startMinute: string;
    interval: string;
    timeRows: number;
  };
  dayDates: Record<DayOfWeek, string>;
  schedules: ScheduleCell[];
  isActive: boolean;
  onDeleteTeacher: (id: number) => void;
  onUpdateTeacherName: (id: number, name: string) => void;
  onUpdateScheduleCell: (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => void;
  onClearMultipleCells: (cells: Array<{ teacherId: number; day: DayOfWeek; timeSlot: number }>) => void;
  onAddTimeRow: () => void;
  onDeleteTimeRow: (timeSlot: number) => void;
  onSelectionChange: (selection: {
    teacherId: number;
    day: DayOfWeek;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  } | null) => void;
}

const TeacherTable = ({
  teacher,
  teacherMode,
  timeMode,
  timeSettings,
  dayDates,
  schedules,
  isActive,
  onDeleteTeacher,
  onUpdateTeacherName,
  onUpdateScheduleCell,
  onClearMultipleCells,
  onAddTimeRow,
  onDeleteTimeRow,
  onSelectionChange,
}: TeacherTableProps) => {
  const days: DayOfWeek[] = ["월", "화", "수", "목", "금", "토", "일"];
  const [columnWidths, setColumnWidths] = useState<Record<DayOfWeek, number>>({
    월: 96, 화: 96, 수: 96, 목: 96, 금: 96, 토: 96, 일: 96 // w-24 = 96px
  });
  const measureRef = useRef<HTMLSpanElement>(null);

  // 병합 정보 조회 함수
  const getCellData = (day: DayOfWeek, timeSlot: number) => {
    const cell = schedules.find(c =>
      c.teacherId === teacher.id &&
      c.day === day &&
      c.timeSlot === timeSlot
    );

    return {
      content: cell?.content || '',
      rowspan: cell?.rowspan || 1,
      isMergedChild: cell?.isMergedChild || false
    };
  };

  const navigation = useTableNavigation({
    rows: timeSettings.timeRows,
    cols: 7,
    isTextarea: true,
    isActive,
    onClearCells: (cells) => {
      // 삭제할 셀들 목록 생성
      const scheduleCellsToDelete: Array<{ teacherId: number; day: DayOfWeek; timeSlot: number }> = [];

      cells.forEach(({ row, col }) => {
        if (row >= 0 && row < timeSettings.timeRows && col >= 0 && col < 7) {
          const day = days[col];
          const timeSlot = row;
          scheduleCellsToDelete.push({ teacherId: teacher.id, day, timeSlot });
        }
      });

      // 한 번에 모든 셀 삭제
      if (scheduleCellsToDelete.length > 0) {
        onClearMultipleCells(scheduleCellsToDelete);
      }
    },
    onSelectionChange: (range) => {
      if (!range) {
        onSelectionChange(null);
        return;
      }

      // TeacherTable 좌표계에서 SchedulePage 형식으로 변환
      const day = days[range.start.col];
      onSelectionChange({
        teacherId: teacher.id,
        day,
        startRow: Math.min(range.start.row, range.end.row),
        endRow: Math.max(range.start.row, range.end.row),
        startCol: range.start.col,
        endCol: range.end.col
      });
    },
    getMergeInfo: (row, col) => {
      if (row < 0 || row >= timeSettings.timeRows || col < 0 || col >= 7) {
        return { isMerged: false, isMainCell: false, mainRow: row, rowspan: 1 };
      }

      const day = days[col];
      const timeSlot = row;

      const cell = schedules.find(c =>
        c.teacherId === teacher.id &&
        c.day === day &&
        c.timeSlot === timeSlot
      );

      if (cell?.rowspan && cell.rowspan > 1) {
        // 메인 셀
        return { isMerged: true, isMainCell: true, mainRow: row, rowspan: cell.rowspan };
      } else if (cell?.isMergedChild) {
        // 자식 셀 - 메인 셀 찾기
        for (let t = timeSlot - 1; t >= 0; t--) {
          const mainCell = schedules.find(c =>
            c.teacherId === teacher.id &&
            c.day === day &&
            c.timeSlot === t &&
            c.rowspan &&
            c.rowspan > 1
          );
          if (mainCell && mainCell.rowspan && t + mainCell.rowspan > timeSlot) {
            return { isMerged: true, isMainCell: false, mainRow: t, rowspan: mainCell.rowspan };
          }
        }
      }

      return { isMerged: false, isMainCell: false, mainRow: row, rowspan: 1 };
    }
  });

  // textarea 특수 처리 핸들러
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    row: number,
    col: number
  ) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, value } = target;
    const { key } = e;

    const isEditing = navigation.editingCell && navigation.editingCell.row === row && navigation.editingCell.col === col;

    // Alt+Enter: 줄바꿈 허용 (네비게이션 차단)
    if (e.altKey && key === 'Enter') {
      // 기본 동작 허용 (줄바꿈)
      return;
    }

    // 편집 모드가 아닐 때는 방향키를 항상 네비게이션으로 처리
    if (!isEditing) {
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      // Delete 키 (편집 모드가 아닐 때만)
      if (key === 'Delete') {
        navigation.handleKeyDown(e, row, col);
        return;
      }
    } else {
      // 편집 모드일 때는 상하는 항상 네비게이션, 좌우는 커서가 끝에 있을 때만
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === 'ArrowLeft' && selectionStart === 0) {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }

      if (key === 'ArrowRight' && selectionStart === value.length) {
        e.preventDefault();
        navigation.handleKeyDown(e, row, col);
        return;
      }
    }

    // Enter, Tab, F2, Escape 처리
    if (['Enter', 'Tab', 'F2', 'Escape'].includes(key)) {
      navigation.handleKeyDown(e, row, col);
    }
  };

  // 텍스트 너비 측정 함수
  const measureTextWidth = (text: string): number => {
    if (!measureRef.current) return 96;
    measureRef.current.textContent = text || 'placeholder';
    return measureRef.current.offsetWidth + 16; // padding 포함
  };

  // 각 요일 열의 최대 너비 계산
  const calculateColumnWidths = () => {
    const minWidth = 96; // w-24
    const newWidths: Record<DayOfWeek, number> = {
      월: minWidth, 화: minWidth, 수: minWidth, 목: minWidth,
      금: minWidth, 토: minWidth, 일: minWidth
    };

    days.forEach((day) => {
      let maxWidth = minWidth;

      // 요일 헤더 너비 (예: "월(1/22)")
      const headerText = dayDates[day] ? `${day}(${dayDates[day]})` : day;
      const headerWidth = measureTextWidth(headerText);
      maxWidth = Math.max(maxWidth, headerWidth);

      // 모든 시간 슬롯의 내용 확인
      for (let timeSlot = 0; timeSlot < timeSettings.timeRows; timeSlot++) {
        const cellData = getCellData(day, timeSlot);
        if (cellData.content) {
          const contentWidth = measureTextWidth(cellData.content);
          maxWidth = Math.max(maxWidth, contentWidth);
        }
      }

      newWidths[day] = maxWidth;
    });

    setColumnWidths(newWidths);
  };

  // 데이터 변경 시 너비 재계산
  useEffect(() => {
    calculateColumnWidths();
  }, [schedules, dayDates, timeSettings.timeRows]);

  // 기본 시간 배열 동적 생성 (1:00부터 30분 간격)
  const generateDefaultTimes = useMemo(() => {
    const times = [];
    let hour = 1;
    let minute = 0;

    for (let i = 0; i < timeSettings.timeRows; i++) {
      const startH = hour;
      const startM = minute;

      minute += 30;
      if (minute >= 60) {
        hour++;
        minute = 0;
      }

      const endH = hour;
      const endM = minute;

      times.push(`${startH}:${startM.toString().padStart(2, "0")}-${endH}:${endM.toString().padStart(2, "0")}`);
    }

    return times;
  }, [timeSettings.timeRows]);

  const calculateTimes = useMemo(() => {
    const { startHour, startMinute, interval, timeRows } = timeSettings;
    if (!startHour || !startMinute || !interval) return [];

    // "오전 9" -> 9, "오후 1" -> 13 변환
    const isPM = startHour.includes("오후");
    let hour = parseInt(startHour.replace(/[^0-9]/g, ""));
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    let currentMinute = parseInt(startMinute);
    const intervalNum = parseInt(interval);

    const times = [];
    for (let i = 0; i < timeRows; i++) {
      const startH = hour;
      const startM = currentMinute;

      currentMinute += intervalNum;
      if (currentMinute >= 60) {
        hour++;
        currentMinute -= 60;
      }

      const endH = hour;
      const endM = currentMinute;

      // 12시간 형식으로 변환 (0 -> 12, 13 -> 1, 14 -> 2 등)
      const format12Hour = (h: number) => {
        if (h === 0) return 12;
        if (h > 12) return h - 12;
        return h;
      };

      const formatTime = (h: number, m: number) => `${format12Hour(h)}:${m.toString().padStart(2, "0")}`;
      times.push(`${formatTime(startH, startM)}-${formatTime(endH, endM)}`);
    }

    return times;
  }, [timeSettings]);

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

      <div className="flex ml-2 mt-2 mr-2" data-table-id={`teacher-${teacher.id}`}>
      {/* 시간 열 (첫 번째 셀은 선생님 이름) */}
      <div className="flex flex-col w-24">
        <div className="border w-full h-7 flex items-center">
          {teacherMode ? (
            <button className="w-full h-full" onClick={() => onDeleteTeacher(teacher.id)}>
              X
            </button>
          ) : (
            <input
              className="w-full h-full outline-none px-1 text-center"
              placeholder="선생님이름"
              value={teacher.name}
              onChange={(e) => onUpdateTeacherName(teacher.id, e.target.value)}
            />
          )}
        </div>
        {Array.from({ length: timeSettings.timeRows }).map((_, index) => (
          <div key={index} className="border-x border-b h-7 flex items-center text-sm">
            {timeMode && (
              <button className="w-6 h-full text-red-500" onClick={() => onDeleteTimeRow(index)}>
                X
              </button>
            )}
            <div className="flex-1 flex items-center justify-center">{calculateTimes[index] || generateDefaultTimes[index]}</div>
          </div>
        ))}
        {timeMode && (
          <button className="w-full h-10 flex justify-center items-center" onClick={onAddTimeRow}>
            <CiSquarePlus size={32} />
          </button>
        )}
      </div>

      {/* 요일 열들 */}
      {days.map((day, dayIndex) => (
        <div key={day} className="flex flex-col" style={{ width: `${columnWidths[day]}px` }}>
          <div className="border h-7 flex items-center justify-center text-sm" style={{ width: `${columnWidths[day]}px` }}>
            {dayDates[day] ? `${day}(${dayDates[day]})` : day}
          </div>
          {Array.from({ length: timeSettings.timeRows }).map((_, timeSlot) => {
            const cellData = getCellData(day, timeSlot);

            // 병합된 자식 셀은 렌더링 스킵
            if (cellData.isMergedChild) {
              return null;
            }

            const isEditing = navigation.editingCell?.row === timeSlot && navigation.editingCell?.col === dayIndex;
            const cellHeight = cellData.rowspan * 28; // 28px = h-7

            return (
              <div key={timeSlot} className="border-x border-b" style={{ width: `${columnWidths[day]}px`, height: `${cellHeight}px` }}>
                <textarea
                  data-row={timeSlot}
                  data-col={dayIndex}
                  ref={el => {
                    // 메인 셀의 ref 설정
                    if (!navigation.cellRefs.current[timeSlot]) {
                      navigation.cellRefs.current[timeSlot] = [];
                    }
                    navigation.cellRefs.current[timeSlot][dayIndex] = el;

                    // 병합된 경우 자식 셀 위치에도 같은 ref 설정
                    if (cellData.rowspan > 1) {
                      for (let i = 1; i < cellData.rowspan; i++) {
                        const childSlot = timeSlot + i;
                        if (!navigation.cellRefs.current[childSlot]) {
                          navigation.cellRefs.current[childSlot] = [];
                        }
                        navigation.cellRefs.current[childSlot][dayIndex] = el;
                      }
                    }
                  }}
                  className="w-full h-full outline-none resize-none"
                  value={cellData.content}
                  readOnly={!isEditing}
                  onChange={(e) => onUpdateScheduleCell(teacher.id, day, timeSlot, e.target.value)}
                  onKeyDown={(e) => handleTextareaKeyDown(e, timeSlot, dayIndex)}
                  onFocus={() => navigation.focusCell(timeSlot, dayIndex)}
                  onDoubleClick={() => navigation.enterEditMode(timeSlot, dayIndex)}
                  onBlur={() => navigation.exitEditMode()}
                  onMouseDown={() => navigation.handleMouseDown(timeSlot, dayIndex)}
                  onMouseEnter={() => navigation.handleMouseEnter(timeSlot, dayIndex)}
                  onMouseUp={() => navigation.handleMouseUp()}
                  style={{
                    ...navigation.getCellStyle(timeSlot, dayIndex),
                    cursor: isEditing ? 'text' : 'default',
                    userSelect: navigation.isSelecting ? 'none' : 'auto',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </>
  );
};

export default TeacherTable;
