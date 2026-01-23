import TimeTable from "../components/TimeTable";
import TeacherTable from "../components/TeacherTable";
import { useState, useMemo, useEffect } from "react";
import SetTimeModal from "../components/SetTimeModal";
import NewPageModal from "../components/NewPageModal";
import PageTab from "../components/PageTab";
import { useAppData } from "../hooks/useAppData";
import type { DayOfWeek, SchedulePageData, CreatePageType } from "../util/interfaces";
import { findMergeCells, getMergedText, hasOverlappingMerge } from "../util/mergeUtils";

const SchedulePage = () => {
  const [dayOrTeacher, setDayOrTeacher] = useState(true); // true: 요일별, false: 선생님별
  const [teacherMode, setTeacherMode] = useState(false);
  const [timeMode, setTimeMode] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    teacherId?: number;
    day?: DayOfWeek;
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  } | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>("day-월"); // "day-월" 또는 "teacher-1" 형식

  const { data, updateData } = useAppData();
  const scheduleData = data.schedule;

  // 현재 페이지 조회
  const currentPage = useMemo(() => {
    // pages가 비어있으면 기본 페이지 반환
    if (scheduleData.pages.length === 0) {
      return createEmptyPage(0, "시간표1");
    }

    const page = scheduleData.pages.find((p) => p.pageId === scheduleData.currentPageId);
    if (!page) {
      // 폴백: 첫 번째 페이지
      return scheduleData.pages[0];
    }
    return page;
  }, [scheduleData]);

  // 현재 페이지 업데이트 헬퍼
  const updateCurrentPage = (updater: (page: SchedulePageData) => SchedulePageData) => {
    updateData('schedule', {
      ...scheduleData,
      pages: scheduleData.pages.map((page) =>
        page.pageId === scheduleData.currentPageId ? updater(page) : page
      )
    });
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
    const newPage: SchedulePageData = type === "empty"
      ? createEmptyPage(scheduleData.nextPageId, name)
      : createCopyPage(currentPage, scheduleData.nextPageId, name);

    updateData('schedule', {
      ...scheduleData,
      pages: [...scheduleData.pages, newPage],
      currentPageId: scheduleData.nextPageId,
      nextPageId: scheduleData.nextPageId + 1
    });
    setShowNewPageModal(false);
  };

  const handleDeletePage = (pageId: number) => {
    if (scheduleData.pages.length === 1) {
      alert("마지막 페이지는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("페이지를 삭제하시겠습니까?")) return;

    const remainingPages = scheduleData.pages.filter((p) => p.pageId !== pageId);

    updateData('schedule', {
      ...scheduleData,
      pages: remainingPages,
      currentPageId: scheduleData.currentPageId === pageId ? remainingPages[0].pageId : scheduleData.currentPageId
    });
  };

  const handleRenamePage = (pageId: number, newName: string) => {
    updateData('schedule', {
      ...scheduleData,
      pages: scheduleData.pages.map((page) =>
        page.pageId === pageId ? { ...page, pageName: newName } : page
      )
    });
  };

  const handleSwitchPage = (pageId: number) => {
    updateData('schedule', {
      ...scheduleData,
      currentPageId: pageId
    });
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
        // 기존 셀이 있는 경우
        if (content === '') {
          // 내용이 비어있으면 셀 삭제 (병합 정보도 함께 제거)
          return {
            ...page,
            schedules: page.schedules.filter((_s, i) => i !== existingIndex),
          };
        } else {
          // 내용이 있으면 업데이트
          return {
            ...page,
            schedules: page.schedules.map((s, i) => (i === existingIndex ? { ...s, content } : s)),
          };
        }
      } else {
        // 새로 추가 (빈 문자열이면 추가하지 않음)
        if (content === '') {
          return page;
        }
        return {
          ...page,
          schedules: [...page.schedules, { teacherId, day, timeSlot, content }],
        };
      }
    });
  };

  // 여러 셀을 한 번에 삭제하는 함수
  const handleClearMultipleCells = (cellsToDelete: Array<{ teacherId: number; day: DayOfWeek; timeSlot: number }>) => {
    updateCurrentPage((page) => {
      // 삭제할 셀들의 키 Set 생성
      const keysToDelete = new Set(
        cellsToDelete.map(({ teacherId, day, timeSlot }) => `${teacherId}-${day}-${timeSlot}`)
      );

      // 해당 키를 가진 셀들을 제외하고 필터링
      return {
        ...page,
        schedules: page.schedules.filter((cell) => {
          const key = `${cell.teacherId}-${cell.day}-${cell.timeSlot}`;
          return !keysToDelete.has(key);
        }),
      };
    });
  };

  // 시간 행 추가 함수
  const handleAddTimeRow = () => {
    updateCurrentPage((page) => ({
      ...page,
      timeSettings: { ...page.timeSettings, timeRows: page.timeSettings.timeRows + 1 },
    }));
  };

  // 시간 행 삭제 함수 (병합 정보 보존)
  const handleDeleteTimeRow = (timeSlot: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      updateCurrentPage((page) => ({
        ...page,
        schedules: page.schedules
          .map((schedule) => {
            if (schedule.timeSlot === timeSlot) {
              return null; // 삭제
            }
            if (schedule.timeSlot > timeSlot) {
              // timeSlot 재조정 (병합 정보는 유지)
              return { ...schedule, timeSlot: schedule.timeSlot - 1 };
            }
            return schedule;
          })
          .filter((s): s is NonNullable<typeof s> => s !== null),
        timeSettings: { ...page.timeSettings, timeRows: Math.max(1, page.timeSettings.timeRows - 1) },
      }));
    }
  };

  // 헬퍼 함수들
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

  // 뷰 전환 시 선택 초기화
  useEffect(() => {
    setSelectedRange(null);
    if (dayOrTeacher) {
      setActiveTable("day-월");
    } else if (currentPage.teachers.length > 0) {
      setActiveTable(`teacher-${currentPage.teachers[0].id}`);
    }
  }, [dayOrTeacher, currentPage.teachers]);

  // 선택 범위 핸들러 (디버깅용 로그 포함)
  const handleSelectionChange = (tableId: string, selection: typeof selectedRange) => {
    console.log('Selection changed:', tableId, selection);
    setActiveTable(tableId);
    setSelectedRange(selection);
  };

  // 병합 선택 검증 함수
  const validateMergeSelection = (
    range: typeof selectedRange,
    viewMode: boolean
  ): { valid: boolean; message?: string } => {
    if (!range) return { valid: false, message: '선택된 셀이 없습니다.' };

    const { startRow, endRow, startCol, endCol } = range;

    // 수평 선택 검사
    if (startCol !== endCol) {
      return { valid: false, message: '세로 방향으로만 병합 가능합니다.' };
    }

    // 최소 2개 셀 검사
    if (startRow === endRow) {
      return { valid: false, message: '최소 2개 이상의 셀을 선택해야 합니다.' };
    }

    // TimeTable의 경우 row 0 (선생님 이름) 제외
    if (viewMode && startRow === 0) {
      return { valid: false, message: '선생님 이름 셀은 병합할 수 없습니다.' };
    }

    return { valid: true };
  };

  // 병합 실행 함수
  const handleMergeCells = (lastFocusedTextarea?: HTMLTextAreaElement | null) => {
    if (!selectedRange) return;

    const validation = validateMergeSelection(selectedRange, dayOrTeacher);
    if (!validation.valid) {
      alert(validation.message);
      // 경고창 후 원래 포커스된 셀로 복원
      setTimeout(() => {
        if (lastFocusedTextarea) {
          lastFocusedTextarea.focus();
        }
      }, 0);
      return;
    }

    const { startRow, endRow, teacherId, day } = selectedRange;

    // TimeTable의 경우 row -> timeSlot 변환 (row 0 = 선생님 이름이므로 -1)
    const startTimeSlot = dayOrTeacher ? startRow - 1 : startRow;
    const endTimeSlot = dayOrTeacher ? endRow - 1 : endRow;

    // 겹치는 병합 검사
    if (hasOverlappingMerge(currentPage.schedules, teacherId!, day!, startTimeSlot, endTimeSlot)) {
      alert('이미 병합된 셀이 포함되어 있습니다.');
      // 경고창 후 원래 포커스된 셀로 복원
      setTimeout(() => {
        if (lastFocusedTextarea) {
          lastFocusedTextarea.focus();
        }
      }, 0);
      return;
    }

    // 기존 셀 찾기
    const existingCells = findMergeCells(currentPage.schedules, teacherId!, day!, startTimeSlot, endTimeSlot);
    const mergedText = getMergedText(existingCells);

    const rowspan = endTimeSlot - startTimeSlot + 1;

    updateCurrentPage((page) => {
      // 기존 셀 제거
      const filtered = page.schedules.filter(cell =>
        !(cell.teacherId === teacherId &&
          cell.day === day &&
          cell.timeSlot >= startTimeSlot &&
          cell.timeSlot <= endTimeSlot)
      );

      // 새 셀 추가
      for (let i = 0; i < rowspan; i++) {
        filtered.push({
          teacherId: teacherId!,
          day: day!,
          timeSlot: startTimeSlot + i,
          content: i === 0 ? mergedText : '',
          rowspan: i === 0 ? rowspan : undefined,
          isMergedChild: i > 0 ? true : undefined
        });
      }

      return { ...page, schedules: filtered };
    });

    // 병합 후 병합된 셀로 포커스 이동 (다음 렌더링 사이클에서)
    setSelectedRange(null);
    setTimeout(() => {
      // 병합 범위 전체를 선택 (병합 해제 버튼이 활성화되도록)
      setSelectedRange({
        teacherId: teacherId!,
        day: day!,
        startRow: startRow,
        endRow: endRow, // 병합된 전체 범위의 끝
        startCol: selectedRange.startCol,
        endCol: selectedRange.startCol
      });

      // 약간의 지연 후 실제 DOM 요소에 포커스
      setTimeout(() => {
        // 병합된 셀의 좌표로 textarea 찾기 (activeTable을 사용하여 정확한 테이블 선택)
        const targetRow = startRow;
        const targetCol = selectedRange.startCol;
        const tableSelector = `[data-table-id="${activeTable}"]`;
        const textarea = document.querySelector(`${tableSelector} textarea[data-row="${targetRow}"][data-col="${targetCol}"]`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 50);
    }, 0);
  };

  // 병합 해제 함수
  const handleUnmergeCells = () => {
    if (!selectedRange) return;

    const { startRow, endRow, teacherId, day, startCol } = selectedRange;
    const timeSlot = dayOrTeacher ? startRow - 1 : startRow;

    // 병합 해제 전에 원래 범위를 변수에 저장
    const originalEndRow = endRow;
    const originalStartCol = startCol;

    updateCurrentPage((page) => {
      // 먼저 메인 셀을 찾아서 rowspan 값을 확인
      const mainCell = page.schedules.find(cell =>
        cell.teacherId === teacherId &&
        cell.day === day &&
        cell.timeSlot === timeSlot &&
        cell.rowspan
      );

      if (!mainCell || !mainCell.rowspan) {
        // 병합된 셀이 아니면 아무것도 하지 않음
        return page;
      }

      const mergeEndSlot = timeSlot + mainCell.rowspan - 1;

      const updatedSchedules = page.schedules.map(cell => {
        // 메인 셀의 rowspan 제거
        if (cell.teacherId === teacherId &&
            cell.day === day &&
            cell.timeSlot === timeSlot &&
            cell.rowspan) {
          const { rowspan, ...rest } = cell;
          return rest;
        }

        // 정확히 이 병합 범위에 속한 자식 셀의 isMergedChild만 제거
        if (cell.teacherId === teacherId &&
            cell.day === day &&
            cell.timeSlot > timeSlot &&
            cell.timeSlot <= mergeEndSlot &&
            cell.isMergedChild) {
          const { isMergedChild, ...rest } = cell;
          return rest;
        }

        return cell;
      });

      return { ...page, schedules: updatedSchedules };
    });

    // 병합 해제 후 원래 병합 범위를 다시 선택 (병합 가능하도록)
    setSelectedRange(null);
    setTimeout(() => {
      // 원래 병합 범위 전체를 선택
      setSelectedRange({
        teacherId: teacherId!,
        day: day!,
        startRow: startRow,
        endRow: originalEndRow, // 원래 병합 범위의 끝
        startCol: originalStartCol,
        endCol: originalStartCol
      });

      // 약간의 지연 후 실제 DOM 요소에 포커스
      setTimeout(() => {
        const targetRow = startRow;
        const targetCol = originalStartCol;
        const tableSelector = `[data-table-id="${activeTable}"]`;
        const textarea = document.querySelector(`${tableSelector} textarea[data-row="${targetRow}"][data-col="${targetCol}"]`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 50);
    }, 0);
  };

  // 병합/해제 토글 함수
  const handleMergeToggle = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedRange) return;

    // blur 전에 현재 포커스된 textarea 저장
    let lastFocusedTextarea: HTMLTextAreaElement | null = null;
    const currentFocused = document.activeElement;

    if (currentFocused && currentFocused.tagName === 'TEXTAREA') {
      lastFocusedTextarea = currentFocused as HTMLTextAreaElement;
    } else {
      // 버튼에 포커스가 있으면 테이블에서 포커스 찾기
      const tableSelector = `[data-table-id="${activeTable}"]`;
      const textareas = document.querySelectorAll(`${tableSelector} textarea`);
      // 선택 범위 내에서 포커스 찾기
      for (const ta of textareas) {
        const textarea = ta as HTMLTextAreaElement;
        const row = parseInt(textarea.getAttribute('data-row') || '0');
        const col = parseInt(textarea.getAttribute('data-col') || '0');

        const minRow = Math.min(selectedRange.startRow, selectedRange.endRow);
        const maxRow = Math.max(selectedRange.startRow, selectedRange.endRow);
        const minCol = Math.min(selectedRange.startCol, selectedRange.endCol);
        const maxCol = Math.max(selectedRange.startCol, selectedRange.endCol);

        if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
          lastFocusedTextarea = textarea;
          break;
        }
      }
    }

    // 버튼에서 포커스 제거
    if (e) {
      e.currentTarget.blur();
    } else {
      // 키보드 단축키로 호출된 경우 현재 포커스된 요소에서 blur
      (document.activeElement as HTMLElement)?.blur();
    }

    const { startRow, endRow, teacherId, day } = selectedRange;
    const startTimeSlot = dayOrTeacher ? startRow - 1 : startRow;
    const endTimeSlot = dayOrTeacher ? endRow - 1 : endRow;

    // 선택 범위의 시작 셀 찾기
    const startCell = currentPage.schedules.find(c =>
      c.teacherId === teacherId &&
      c.day === day &&
      c.timeSlot === startTimeSlot
    );

    // 선택 범위가 정확히 하나의 병합 셀과 일치하는지 확인
    if (startCell?.rowspan && startCell.rowspan > 1) {
      const mergeEndSlot = startTimeSlot + startCell.rowspan - 1;
      // 선택 범위가 병합 셀 전체와 정확히 일치하면 해제
      if (mergeEndSlot === endTimeSlot) {
        handleUnmergeCells();
        return;
      }
    }

    // 그 외의 경우는 병합 시도 (저장된 포커스 전달)
    handleMergeCells(lastFocusedTextarea);
  };

  // 버튼 텍스트 결정
  const getMergeButtonText = (): string => {
    if (!selectedRange) return '병합';

    const { startRow, endRow, teacherId, day } = selectedRange;
    const startTimeSlot = dayOrTeacher ? startRow - 1 : startRow;
    const endTimeSlot = dayOrTeacher ? endRow - 1 : endRow;

    const startCell = currentPage.schedules.find(c =>
      c.teacherId === teacherId &&
      c.day === day &&
      c.timeSlot === startTimeSlot
    );

    // 선택 범위가 정확히 하나의 병합 셀과 일치하는지 확인
    if (startCell?.rowspan && startCell.rowspan > 1) {
      const mergeEndSlot = startTimeSlot + startCell.rowspan - 1;
      if (mergeEndSlot === endTimeSlot) {
        return '병합 해제';
      }
    }

    return '병합';
  };

  // Ctrl+M 단축키 및 방향키 포커스 복원 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+M: 병합/해제
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handleMergeToggle();
        return;
      }

      // 방향키: 포커스가 테이블 밖에 있으면 테이블로 복귀
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const activeElement = document.activeElement;
        const isInTable = activeElement?.tagName === 'TEXTAREA' ||
                         (activeElement?.tagName === 'INPUT' && activeElement.getAttribute('type') === 'text');

        if (!isInTable && selectedRange && activeTable) {
          e.preventDefault();
          // 마지막 선택된 셀로 포커스 복원 (activeTable을 사용하여 정확한 테이블 선택)
          const targetRow = selectedRange.startRow;
          const targetCol = selectedRange.startCol;
          const tableSelector = `[data-table-id="${activeTable}"]`;
          const textarea = document.querySelector(`${tableSelector} textarea[data-row="${targetRow}"][data-col="${targetCol}"]`) as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRange, currentPage.schedules, dayOrTeacher]);

  return (
    <div className="flex flex-col h-full">
      {/* 페이지 탭 영역 */}
      <div className="flex items-end bg-gray-100 border-b">
        <button onClick={() => setShowNewPageModal(true)} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 shrink-0">
          + 새페이지
        </button>
        {scheduleData.pages.map((page) => (
          <PageTab
            key={page.pageId}
            page={page}
            isActive={page.pageId === scheduleData.currentPageId}
            canDelete={scheduleData.pages.length > 1}
            onClick={() => handleSwitchPage(page.pageId)}
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
        <button
          onClick={handleMergeToggle}
          disabled={!selectedRange}
          className={`px-4 py-2 ${selectedRange ? 'font-bold bg-blue-200' : 'text-gray-400'}`}
          title={selectedRange ? `선택: ${selectedRange.startRow}-${selectedRange.endRow}, col: ${selectedRange.startCol}` : '셀을 선택하세요'}
        >
          {getMergeButtonText()}
        </button>
      </div>
      {showTimeModal && <SetTimeModal setShowTimeModal={setShowTimeModal} onApply={handleTimeApply} />}
      {showNewPageModal && <NewPageModal onClose={() => setShowNewPageModal(false)} onCreate={handleCreatePage} />}
      {dayOrTeacher ? (
        <div className="flex">
          {(["월", "화", "수", "목", "금", "토", "일"] as DayOfWeek[]).map((day) => {
            const tableId = `day-${day}`;
            return (
              <TimeTable
                key={day}
                day={day}
                teacherMode={teacherMode}
                timeMode={timeMode}
                teachers={currentPage.teachers}
                timeSettings={currentPage.timeSettings}
                dayDate={getDayDate(day)}
                schedules={currentPage.schedules}
                isActive={activeTable === tableId}
                onAddTeacher={handleAddTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onUpdateTeacherName={handleUpdateTeacherName}
                onUpdateScheduleCell={handleUpdateScheduleCell}
                onClearMultipleCells={handleClearMultipleCells}
                onAddTimeRow={handleAddTimeRow}
                onDeleteTimeRow={handleDeleteTimeRow}
                onUpdateDayDate={(date) => handleUpdateDayDate(day, date)}
                getTeacherName={getTeacherName}
                onSelectionChange={(sel) => handleSelectionChange(tableId, sel)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex">
          {currentPage.teachers.map((teacher) => {
            const tableId = `teacher-${teacher.id}`;
            return (
              <TeacherTable
                key={teacher.id}
                teacher={teacher}
                teacherMode={teacherMode}
                timeMode={timeMode}
                timeSettings={currentPage.timeSettings}
                dayDates={currentPage.dayDates}
                schedules={currentPage.schedules}
                isActive={activeTable === tableId}
                onDeleteTeacher={handleDeleteTeacher}
                onUpdateTeacherName={handleUpdateTeacherName}
                onUpdateScheduleCell={handleUpdateScheduleCell}
                onClearMultipleCells={handleClearMultipleCells}
                onAddTimeRow={handleAddTimeRow}
                onDeleteTimeRow={handleDeleteTimeRow}
                onSelectionChange={(sel) => handleSelectionChange(tableId, sel)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SchedulePage;
