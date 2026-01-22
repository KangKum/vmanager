import TimeTable from "../components/TimeTable";
import TeacherTable from "../components/TeacherTable";
import { useState } from "react";
import SetTimeModal from "../components/SetTimeModal";
import type { Teacher, DayOfWeek, ScheduleCell } from "../util/interfaces";

const SchedulePage = () => {
  const [dayOrTeacher, setDayOrTeacher] = useState(true); // true: 요일별, false: 선생님별
  const [teacherMode, setTeacherMode] = useState(false);
  const [timeMode, setTimeMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // 중앙 상태 관리
  const [teachers, setTeachers] = useState<Teacher[]>([{ id: 0, name: "" }]);
  const [nextTeacherId, setNextTeacherId] = useState(1);
  const [schedules, setSchedules] = useState<ScheduleCell[]>([]);
  const [timeSettings, setTimeSettings] = useState({
    startHour: "",
    startMinute: "",
    interval: "",
    timeRows: 8,
  });

  // 선생님 관리 함수들
  const handleAddTeacher = () => {
    setTeachers((prev) => [...prev, { id: nextTeacherId, name: "" }]);
    setNextTeacherId((prev) => prev + 1);
  };

  const handleDeleteTeacher = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
      setSchedules((prev) => prev.filter((schedule) => schedule.teacherId !== id));
    }
  };

  const handleUpdateTeacherName = (id: number, name: string) => {
    setTeachers((prev) => prev.map((teacher) => (teacher.id === id ? { ...teacher, name } : teacher)));
  };

  // 시간표 셀 업데이트 함수
  const handleUpdateScheduleCell = (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => {
    setSchedules((prev) => {
      const existingIndex = prev.findIndex((s) => s.teacherId === teacherId && s.day === day && s.timeSlot === timeSlot);

      if (existingIndex >= 0) {
        // 업데이트
        return prev.map((s, i) => (i === existingIndex ? { ...s, content } : s));
      } else {
        // 새로 추가
        return [...prev, { teacherId, day, timeSlot, content }];
      }
    });
  };

  // 시간 행 추가 함수
  const handleAddTimeRow = () => {
    setTimeSettings((prev) => ({ ...prev, timeRows: prev.timeRows + 1 }));
  };

  // 헬퍼 함수들
  const getCellContent = (teacherId: number, day: DayOfWeek, timeSlot: number): string => {
    const cell = schedules.find((s) => s.teacherId === teacherId && s.day === day && s.timeSlot === timeSlot);
    return cell ? cell.content : "";
  };

  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "";
  };

  const handleTimeApply = (hour: string, minute: string, gap: string) => {
    setTimeSettings((prev) => ({
      ...prev,
      startHour: hour,
      startMinute: minute,
      interval: gap,
    }));
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
        <button className={`${dayOrTeacher ? "font-bold" : ""}`} onClick={() => setDayOrTeacher(true)}>
          요일별
        </button>
        <button className={`${dayOrTeacher ? "" : "font-bold"}`} onClick={() => setDayOrTeacher(false)}>
          선생님별
        </button>
      </div>
      {showTimeModal && <SetTimeModal setShowTimeModal={setShowTimeModal} onApply={handleTimeApply} />}
      {dayOrTeacher ? (
        <div className="flex">
          {(["월", "화", "수", "목", "금", "토", "일"] as DayOfWeek[]).map((day) => (
            <TimeTable
              key={day}
              day={day}
              teacherMode={teacherMode}
              timeMode={timeMode}
              teachers={teachers}
              timeSettings={timeSettings}
              onAddTeacher={handleAddTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onUpdateTeacherName={handleUpdateTeacherName}
              onUpdateScheduleCell={handleUpdateScheduleCell}
              onAddTimeRow={handleAddTimeRow}
              getCellContent={getCellContent}
              getTeacherName={getTeacherName}
            />
          ))}
        </div>
      ) : (
        <div className="flex">
          {teachers.map((teacher) => (
            <TeacherTable
              key={teacher.id}
              teacher={teacher}
              teacherMode={teacherMode}
              timeMode={timeMode}
              timeSettings={timeSettings}
              onDeleteTeacher={handleDeleteTeacher}
              onUpdateTeacherName={handleUpdateTeacherName}
              onUpdateScheduleCell={handleUpdateScheduleCell}
              onAddTimeRow={handleAddTimeRow}
              getCellContent={getCellContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default SchedulePage;
