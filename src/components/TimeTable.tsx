import TeacherCol from "./TeacherCol";
import { useMemo } from "react";
import { CiSquarePlus } from "react-icons/ci";
import type { Teacher, DayOfWeek } from "../util/interfaces";

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
  onAddTeacher: () => void;
  onDeleteTeacher: (id: number) => void;
  onUpdateTeacherName: (id: number, name: string) => void;
  onUpdateScheduleCell: (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => void;
  onAddTimeRow: () => void;
  onDeleteTimeRow: (timeSlot: number) => void;
  getCellContent: (teacherId: number, day: DayOfWeek, timeSlot: number) => string;
  getTeacherName: (teacherId: number) => string;
}

const TimeTable = ({
  day,
  teacherMode,
  timeMode,
  teachers,
  timeSettings,
  onAddTeacher,
  onDeleteTeacher,
  onUpdateTeacherName,
  onUpdateScheduleCell,
  onAddTimeRow,
  onDeleteTimeRow,
  getCellContent,
  getTeacherName,
}: TimeTableProps) => {
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
      <div className="firstCol flex flex-col w-22">
        <div className="dayDiv border h-7 w-full">
          <button className="dayBtn w-full h-full outline-none text-center">{day}</button>
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
      {teachers.map((teacher) => (
        <TeacherCol
          key={teacher.id}
          teacherId={teacher.id}
          day={day}
          teacherMode={teacherMode}
          timeRows={timeSettings.timeRows}
          teacherName={getTeacherName(teacher.id)}
          onUpdateName={(name) => onUpdateTeacherName(teacher.id, name)}
          onDelete={() => onDeleteTeacher(teacher.id)}
          onUpdateCell={(timeSlot, content) => onUpdateScheduleCell(teacher.id, day, timeSlot, content)}
          getCellContent={(timeSlot) => getCellContent(teacher.id, day, timeSlot)}
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
