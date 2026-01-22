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
  // 각 요일별 날짜 저장
  const [dayDates, setDayDates] = useState<Record<DayOfWeek, string>>({
    월: "",
    화: "",
    수: "",
    목: "",
    금: "",
    토: "",
    일: "",
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

  // 시간 행 삭제 함수
  const handleDeleteTimeRow = (timeSlot: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      // 해당 timeSlot의 스케줄 삭제 및 이후 timeSlot들 재조정
      setSchedules((prev) =>
        prev
          .filter((schedule) => schedule.timeSlot !== timeSlot)
          .map((schedule) => (schedule.timeSlot > timeSlot ? { ...schedule, timeSlot: schedule.timeSlot - 1 } : schedule)),
      );
      // timeRows 감소
      setTimeSettings((prev) => ({ ...prev, timeRows: Math.max(1, prev.timeRows - 1) }));
    }
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

  const handleUpdateDayDate = (day: DayOfWeek, date: string) => {
    // 날짜 파싱 (M/D 형식)
    const [month, dayNum] = date.split("/").map(Number);

    // 요일 인덱스 맵
    const dayIndexMap: Record<DayOfWeek, number> = {
      월: 0,
      화: 1,
      수: 2,
      목: 3,
      금: 4,
      토: 5,
      일: 6,
    };

    const selectedDayIndex = dayIndexMap[day];
    const baseDate = new Date(new Date().getFullYear(), month - 1, dayNum);

    const newDates: Record<DayOfWeek, string> = { ...dayDates };

    // 월-금 중 하나를 선택한 경우
    if (selectedDayIndex <= 4) {
      // 월요일부터 금요일까지 자동 계산
      (["월", "화", "수", "목", "금"] as DayOfWeek[]).forEach((d) => {
        const targetIndex = dayIndexMap[d];
        const diff = targetIndex - selectedDayIndex;
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + diff);
        newDates[d] = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
      });
    }
    // 토-일 중 하나를 선택한 경우
    else {
      if (day === "토") {
        newDates["토"] = date;
        const sunday = new Date(baseDate);
        sunday.setDate(baseDate.getDate() + 1);
        newDates["일"] = `${sunday.getMonth() + 1}/${sunday.getDate()}`;
      } else if (day === "일") {
        newDates["일"] = date;
        const saturday = new Date(baseDate);
        saturday.setDate(baseDate.getDate() - 1);
        newDates["토"] = `${saturday.getMonth() + 1}/${saturday.getDate()}`;
      }
    }

    setDayDates(newDates);
  };

  const getDayDate = (day: DayOfWeek): string => {
    return dayDates[day];
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
              dayDate={getDayDate(day)}
              onAddTeacher={handleAddTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onUpdateTeacherName={handleUpdateTeacherName}
              onUpdateScheduleCell={handleUpdateScheduleCell}
              onAddTimeRow={handleAddTimeRow}
              onDeleteTimeRow={handleDeleteTimeRow}
              onUpdateDayDate={(date) => handleUpdateDayDate(day, date)}
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
              dayDates={dayDates}
              onDeleteTeacher={handleDeleteTeacher}
              onUpdateTeacherName={handleUpdateTeacherName}
              onUpdateScheduleCell={handleUpdateScheduleCell}
              onAddTimeRow={handleAddTimeRow}
              onDeleteTimeRow={handleDeleteTimeRow}
              getCellContent={getCellContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default SchedulePage;
