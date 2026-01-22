import { useMemo } from "react";
import { CiSquarePlus } from "react-icons/ci";
import type { Teacher, DayOfWeek } from "../util/interfaces";

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
  onDeleteTeacher: (id: number) => void;
  onUpdateTeacherName: (id: number, name: string) => void;
  onUpdateScheduleCell: (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => void;
  onAddTimeRow: () => void;
  onDeleteTimeRow: (timeSlot: number) => void;
  getCellContent: (teacherId: number, day: DayOfWeek, timeSlot: number) => string;
}

const TeacherTable = ({
  teacher,
  teacherMode,
  timeMode,
  timeSettings,
  dayDates,
  onDeleteTeacher,
  onUpdateTeacherName,
  onUpdateScheduleCell,
  onAddTimeRow,
  onDeleteTimeRow,
  getCellContent,
}: TeacherTableProps) => {
  const days: DayOfWeek[] = ["월", "화", "수", "목", "금", "토", "일"];

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
    <div className="flex ml-2 mt-2 mr-2">
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
      {days.map((day) => (
        <div key={day} className="flex flex-col w-24">
          <div className="border h-7 flex items-center justify-center text-sm">
            {dayDates[day] ? `${day}(${dayDates[day]})` : day}
          </div>
          {Array.from({ length: timeSettings.timeRows }).map((_, timeSlot) => (
            <div key={timeSlot} className="border-x border-b w-24 h-7">
              <textarea
                className="w-full h-full outline-none resize-none"
                value={getCellContent(teacher.id, day, timeSlot)}
                onChange={(e) => onUpdateScheduleCell(teacher.id, day, timeSlot, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TeacherTable;
