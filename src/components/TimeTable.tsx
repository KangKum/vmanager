import TeacherCol from "./TeacherCol";
import CalendarModal from "./CalendarModal";
import { useMemo, useState } from "react";
import { CiSquarePlus } from "react-icons/ci";
import type { Teacher, DayOfWeek, ScheduleCell } from "../util/interfaces";
import { useTableNavigation } from "../hooks/useTableNavigation";

interface TimeTableProps {
  day: DayOfWeek;
  teacherMode: boolean;
  timeMode: boolean;
  teachers: Teacher[];
  timeSettings: {
    startHour: string;
    startMinute: string;
    interval: string;
    timeRows: number;
  };
  dayDate: string;
  schedules: ScheduleCell[];
  isActive: boolean;
  onAddTeacher: () => void;
  onDeleteTeacher: (id: number) => void;
  onUpdateTeacherName: (id: number, name: string) => void;
  onUpdateScheduleCell: (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => void;
  onClearMultipleCells: (cells: Array<{ teacherId: number; day: DayOfWeek; timeSlot: number }>) => void;
  onAddTimeRow: () => void;
  onDeleteTimeRow: (timeSlot: number) => void;
  onUpdateDayDate: (date: string) => void;
  getTeacherName: (teacherId: number) => string;
  onSelectionChange: (selection: {
    teacherId: number;
    day: DayOfWeek;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  } | null) => void;
}

const TimeTable = ({
  day,
  teacherMode,
  timeMode,
  teachers,
  timeSettings,
  dayDate,
  schedules,
  isActive,
  onAddTeacher,
  onDeleteTeacher,
  onUpdateTeacherName,
  onUpdateScheduleCell,
  onClearMultipleCells,
  onAddTimeRow,
  onDeleteTimeRow,
  onUpdateDayDate,
  getTeacherName,
  onSelectionChange,
}: TimeTableProps) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const navigation = useTableNavigation({
    rows: timeSettings.timeRows + 1, // +1은 선생님 이름 행
    cols: teachers.length,
    isTextarea: true,
    isActive,
    onClearCells: (cells) => {
      // 선생님 이름 행과 시간표 셀 분리
      const teacherNameUpdates: number[] = [];
      const scheduleCellsToDelete: Array<{ teacherId: number; day: DayOfWeek; timeSlot: number }> = [];

      cells.forEach(({ row, col }) => {
        if (col >= 0 && col < teachers.length) {
          const teacher = teachers[col];

          if (row === 0) {
            // 선생님 이름 행
            teacherNameUpdates.push(teacher.id);
          } else if (row >= 1 && row <= timeSettings.timeRows) {
            // 시간표 셀
            const timeSlot = row - 1;
            scheduleCellsToDelete.push({ teacherId: teacher.id, day, timeSlot });
          }
        }
      });

      // 선생님 이름 업데이트
      teacherNameUpdates.forEach((teacherId) => {
        onUpdateTeacherName(teacherId, '');
      });

      // 시간표 셀 한 번에 삭제
      if (scheduleCellsToDelete.length > 0) {
        onClearMultipleCells(scheduleCellsToDelete);
      }
    },
    onSelectionChange: (range) => {
      if (!range) {
        onSelectionChange(null);
        return;
      }

      // TimeTable 좌표계에서 SchedulePage 형식으로 변환
      const teacherId = teachers[range.start.col]?.id;
      if (teacherId === undefined) {
        onSelectionChange(null);
        return;
      }

      onSelectionChange({
        teacherId,
        day,
        startRow: Math.min(range.start.row, range.end.row),
        endRow: Math.max(range.start.row, range.end.row),
        startCol: range.start.col,
        endCol: range.end.col
      });
    },
    getMergeInfo: (row, col) => {
      // row 0은 선생님 이름 (병합 안됨)
      if (row === 0 || col < 0 || col >= teachers.length) {
        return { isMerged: false, isMainCell: false, mainRow: row, rowspan: 1 };
      }

      const teacher = teachers[col];
      const timeSlot = row - 1;

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
            return { isMerged: true, isMainCell: false, mainRow: t + 1, rowspan: mainCell.rowspan };
          }
        }
      }

      return { isMerged: false, isMainCell: false, mainRow: row, rowspan: 1 };
    },
    shouldSkipRow: (row) => row === 0 // 선생님 이름 행은 키보드로 접근 불가
  });

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
    <div className="flex ml-2 mt-2 mr-2" data-table-id={`day-${day}`}>
      {showCalendar && (
        <CalendarModal
          onSelectDate={(date) => {
            onUpdateDayDate(date);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
      <div className="firstCol flex flex-col w-22">
        <div className="dayDiv border h-7 w-full">
          <button className="dayBtn w-full h-full outline-none text-center" onClick={() => setShowCalendar(true)}>
            {dayDate ? `${day}(${dayDate})` : day}
          </button>
        </div>
        {Array.from({ length: timeSettings.timeRows }).map((_, index) => (
          <div key={index} className="border-x border-b h-7 flex">
            {timeMode ? (
              <button className="w-full h-full text-center" onClick={() => onDeleteTimeRow(index)}>
                X
              </button>
            ) : (
              <input value={calculateTimes[index] || generateDefaultTimes[index]} className="w-full h-full outline-none text-center text-sm" readOnly />
            )}
          </div>
        ))}
        {timeMode && (
          <button className="w-full h-10 flex justify-center items-center" onClick={onAddTimeRow}>
            <CiSquarePlus size={32} />
          </button>
        )}
      </div>
      {teachers.map((teacher, colIndex) => (
        <TeacherCol
          key={teacher.id}
          teacherId={teacher.id}
          day={day}
          teacherMode={teacherMode}
          timeRows={timeSettings.timeRows}
          teacherName={getTeacherName(teacher.id)}
          colIndex={colIndex}
          navigation={navigation}
          schedules={schedules}
          onUpdateName={(name) => onUpdateTeacherName(teacher.id, name)}
          onDelete={() => onDeleteTeacher(teacher.id)}
          onUpdateCell={(timeSlot, content) => onUpdateScheduleCell(teacher.id, day, timeSlot, content)}
        />
      ))}
      {teacherMode && (
        <button className="w-10 flex justify-center mr-10" onClick={onAddTeacher}>
          <CiSquarePlus size={32} />
        </button>
      )}
    </div>
  );
};
export default TimeTable;
