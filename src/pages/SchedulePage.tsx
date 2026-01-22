import TimeTable from "../components/TimeTable";
import { useState } from "react";
import SetTimeModal from "../components/SetTimeModal";

const SchedulePage = () => {
  const [dayOrTeacher, setDayOrTeacher] = useState(true); // true: 요일별, false: 선생님별
  const [teacherMode, setTeacherMode] = useState(false);
  const [timeMode, setTimeMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [interval, setInterval] = useState("");

  const handleTimeApply = (hour: string, minute: string, gap: string) => {
    setStartHour(hour);
    setStartMinute(minute);
    setInterval(gap);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 bg-gray-300">
        <button>새페이지</button>
        <button className={`${showTimeModal ? "font-bold" : ""}`} onClick={() => setShowTimeModal(true)}>
          시간설정
        </button>
        <button className={`${timeMode ? "font-bold" : ""}`} onClick={() => setTimeMode(!timeMode)}>
          행설정
        </button>
        <button className={`${teacherMode ? "font-bold" : ""}`} onClick={() => setTeacherMode(!teacherMode)}>
          열설정
        </button>
        <button className={`${dayOrTeacher ? "font-bold" : ""}`}>요일별</button>
        <button className={`${dayOrTeacher ? "" : "font-bold"}`}>선생님별</button>
      </div>
      {showTimeModal && <SetTimeModal setShowTimeModal={setShowTimeModal} onApply={handleTimeApply} />}
      <div className="flex">
        <TimeTable day={"월"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"화"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"수"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"목"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"금"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"토"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
        <TimeTable day={"일"} teacherMode={teacherMode} timeMode={timeMode} startHour={startHour} startMinute={startMinute} interval={interval} />
      </div>
    </div>
  );
};
export default SchedulePage;
