import TeacherCol from "./TeacherCol";
import { useState, useMemo } from "react";
import { CiSquarePlus } from "react-icons/ci";

const TimeTable = ({
  day,
  teacherMode,
  timeMode,
  startHour,
  startMinute,
  interval,
}: {
  day: string;
  teacherMode: boolean;
  timeMode: boolean;
  startHour: string;
  startMinute: string;
  interval: string;
}) => {
  const [teacherColumns, setTeacherColumns] = useState<number>(1);
  const [timeRows, setTimeRows] = useState<number>(8);
  const minute = ["00", "15", "30", "45"];
  const hour = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  const calculateTimes = useMemo(() => {
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
  }, [startHour, startMinute, interval, timeRows]);

  return (
    <div className="flex ml-2 mt-2">
      <div className="firstCol flex flex-col w-24">
        <div className="dayDiv border h-7">
          <input placeholder={day} className="w-full h-full outline-none" />
        </div>
        {calculateTimes.length > 0
          ? calculateTimes.map((time, index) => (
              <div key={index} className="border-x border-b h-7">
                <input value={time} className="w-full h-full outline-none" readOnly />
              </div>
            ))
          : Array.from({ length: timeRows }).map((_, index) => (
              <div key={index} className="border-x border-b h-7">
                <input className="w-full h-full outline-none" />
              </div>
            ))}
        {timeMode && (
          <button className="w-full h-10 flex justify-center items-center" onClick={() => setTimeRows((prev) => prev + 1)}>
            <CiSquarePlus size={32} />
          </button>
        )}
      </div>
      {Array.from({ length: teacherColumns }).map((_, idx) => (
        <TeacherCol key={idx} teacherMode={teacherMode} timeRows={timeRows} />
      ))}
      {teacherMode && (
        <button className="w-10 flex justify-center mr-10" onClick={() => setTeacherColumns((prev) => prev + 1)}>
          <CiSquarePlus size={32} />
        </button>
      )}
    </div>
  );
};
export default TimeTable;
