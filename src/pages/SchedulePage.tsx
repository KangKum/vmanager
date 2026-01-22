import TimeTable from "../components/TimeTable";
import TeacherTable from "../components/TeacherTable";
import { useState, useMemo } from "react";
import SetTimeModal from "../components/SetTimeModal";
import NewPageModal from "../components/NewPageModal";
import PageTab from "../components/PageTab";
import type { DayOfWeek, SchedulePageData, CreatePageType } from "../util/interfaces";

const SchedulePage = () => {
  const [dayOrTeacher, setDayOrTeacher] = useState(true); // true: 요일별, false: 선생님별
  const [teacherMode, setTeacherMode] = useState(false);
  const [timeMode, setTimeMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  // 페이지 배열로 중앙 상태 관리
  const [pages, setPages] = useState<SchedulePageData[]>([
    {
      pageId: 0,
      pageName: "시간표1",
      teachers: [{ id: 0, name: "" }],
      nextTeacherId: 1,
      schedules: [],
      timeSettings: { startHour: "", startMinute: "", interval: "", timeRows: 8 },
      dayDates: { 월: "", 화: "", 수: "", 목: "", 금: "", 토: "", 일: "" },
    },
  ]);
  const [currentPageId, setCurrentPageId] = useState(0);
  const [nextPageId, setNextPageId] = useState(1);

  // 현재 페이지 조회
  const currentPage = useMemo(() => {
    const page = pages.find((p) => p.pageId === currentPageId);
    if (!page) {
      // 폴백: 첫 번째 페이지
      return pages[0];
    }
    return page;
  }, [pages, currentPageId]);

  // 현재 페이지 업데이트 헬퍼
  const updateCurrentPage = (updater: (page: SchedulePageData) => SchedulePageData) => {
    setPages((prev) => prev.map((page) => (page.pageId === currentPageId ? updater(page) : page)));
  };

  // 빈 페이지 생성 함수
  const createEmptyPage = (id: number, name: string): SchedulePageData => ({
    pageId: id,
    pageName: name,
    teachers: [{ id: 0, name: "" }],
    nextTeacherId: 1,
    schedules: [],
    timeSettings: { startHour: "", startMinute: "", interval: "", timeRows: 8 },
    dayDates: { 월: "", 화: "", 수: "", 목: "", 금: "", 토: "", 일: "" },
  });

  // 페이지 복사 함수 (깊은 복사)
  const createCopyPage = (source: SchedulePageData, newId: number, newName: string): SchedulePageData => ({
    pageId: newId,
    pageName: newName,
    teachers: source.teachers.map((t) => ({ ...t })),
    nextTeacherId: source.nextTeacherId,
    schedules: source.schedules.map((s) => ({ ...s })),
    timeSettings: { ...source.timeSettings },
    dayDates: { ...source.dayDates },
  });

  // 페이지 관리 함수들
  const handleCreatePage = (name: string, type: CreatePageType) => {
    const newPage: SchedulePageData = type === "empty" ? createEmptyPage(nextPageId, name) : createCopyPage(currentPage, nextPageId, name);

    setPages((prev) => [...prev, newPage]);
    setCurrentPageId(nextPageId);
    setNextPageId((prev) => prev + 1);
    setShowNewPageModal(false);
  };

  const handleDeletePage = (pageId: number) => {
    if (pages.length === 1) {
      alert("마지막 페이지는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("페이지를 삭제하시겠습니까?")) return;

    const remainingPages = pages.filter((p) => p.pageId !== pageId);
    setPages(remainingPages);

    if (currentPageId === pageId) {
      setCurrentPageId(remainingPages[0].pageId);
    }
  };

  const handleRenamePage = (pageId: number, newName: string) => {
    setPages((prev) => prev.map((page) => (page.pageId === pageId ? { ...page, pageName: newName } : page)));
  };

  // 선생님 관리 함수들 (updateCurrentPage 사용)
  const handleAddTeacher = () => {
    updateCurrentPage((page) => ({
      ...page,
      teachers: [...page.teachers, { id: page.nextTeacherId, name: "" }],
      nextTeacherId: page.nextTeacherId + 1,
    }));
  };

  const handleDeleteTeacher = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      updateCurrentPage((page) => ({
        ...page,
        teachers: page.teachers.filter((teacher) => teacher.id !== id),
        schedules: page.schedules.filter((schedule) => schedule.teacherId !== id),
      }));
    }
  };

  const handleUpdateTeacherName = (id: number, name: string) => {
    updateCurrentPage((page) => ({
      ...page,
      teachers: page.teachers.map((teacher) => (teacher.id === id ? { ...teacher, name } : teacher)),
    }));
  };

  // 시간표 셀 업데이트 함수
  const handleUpdateScheduleCell = (teacherId: number, day: DayOfWeek, timeSlot: number, content: string) => {
    updateCurrentPage((page) => {
      const existingIndex = page.schedules.findIndex((s) => s.teacherId === teacherId && s.day === day && s.timeSlot === timeSlot);

      if (existingIndex >= 0) {
        // 업데이트
        return {
          ...page,
          schedules: page.schedules.map((s, i) => (i === existingIndex ? { ...s, content } : s)),
        };
      } else {
        // 새로 추가
        return {
          ...page,
          schedules: [...page.schedules, { teacherId, day, timeSlot, content }],
        };
      }
    });
  };

  // 시간 행 추가 함수
  const handleAddTimeRow = () => {
    updateCurrentPage((page) => ({
      ...page,
      timeSettings: { ...page.timeSettings, timeRows: page.timeSettings.timeRows + 1 },
    }));
  };

  // 시간 행 삭제 함수
  const handleDeleteTimeRow = (timeSlot: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      updateCurrentPage((page) => ({
        ...page,
        schedules: page.schedules
          .filter((schedule) => schedule.timeSlot !== timeSlot)
          .map((schedule) => (schedule.timeSlot > timeSlot ? { ...schedule, timeSlot: schedule.timeSlot - 1 } : schedule)),
        timeSettings: { ...page.timeSettings, timeRows: Math.max(1, page.timeSettings.timeRows - 1) },
      }));
    }
  };

  // 헬퍼 함수들
  const getCellContent = (teacherId: number, day: DayOfWeek, timeSlot: number): string => {
    const cell = currentPage.schedules.find((s) => s.teacherId === teacherId && s.day === day && s.timeSlot === timeSlot);
    return cell ? cell.content : "";
  };

  const getTeacherName = (teacherId: number): string => {
    const teacher = currentPage.teachers.find((t) => t.id === teacherId);
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

    updateCurrentPage((page) => {
      const newDates: Record<DayOfWeek, string> = { ...page.dayDates };

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

      return { ...page, dayDates: newDates };
    });
  };

  const getDayDate = (day: DayOfWeek): string => {
    return currentPage.dayDates[day];
  };

  const handleTimeApply = (hour: string, minute: string, gap: string) => {
    updateCurrentPage((page) => ({
      ...page,
      timeSettings: {
        ...page.timeSettings,
        startHour: hour,
        startMinute: minute,
        interval: gap,
      },
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* 페이지 탭 영역 */}
      <div className="flex items-end bg-gray-100 border-b">
        <button onClick={() => setShowNewPageModal(true)} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex-shrink-0">
          + 새페이지
        </button>
        {pages.map((page) => (
          <PageTab
            key={page.pageId}
            page={page}
            isActive={page.pageId === currentPageId}
            canDelete={pages.length > 1}
            onClick={() => setCurrentPageId(page.pageId)}
            onRename={(name) => handleRenamePage(page.pageId, name)}
            onDelete={() => handleDeletePage(page.pageId)}
          />
        ))}
      </div>

      {/* 기능 버튼 영역 */}
      <div className="flex gap-4 bg-gray-300">
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
      {showNewPageModal && <NewPageModal nextPageId={nextPageId} onClose={() => setShowNewPageModal(false)} onCreate={handleCreatePage} />}
      {dayOrTeacher ? (
        <div className="flex">
          {(["월", "화", "수", "목", "금", "토", "일"] as DayOfWeek[]).map((day) => (
            <TimeTable
              key={day}
              day={day}
              teacherMode={teacherMode}
              timeMode={timeMode}
              teachers={currentPage.teachers}
              timeSettings={currentPage.timeSettings}
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
          {currentPage.teachers.map((teacher) => (
            <TeacherTable
              key={teacher.id}
              teacher={teacher}
              teacherMode={teacherMode}
              timeMode={timeMode}
              timeSettings={currentPage.timeSettings}
              dayDates={currentPage.dayDates}
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
