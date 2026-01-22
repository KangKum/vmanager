interface IClassTable {
  tableId: number;
  currentLevel: number;
}

interface IStudentRowsInClassTable {
  studentId: number;
  idx: number;
  name: string;
  school: string;
  grade: string;
}

// 시간표 관리용 타입들
interface Teacher {
  id: number;
  name: string;
}

type DayOfWeek = "월" | "화" | "수" | "목" | "금" | "토" | "일";

interface ScheduleCell {
  teacherId: number;
  day: DayOfWeek;
  timeSlot: number;
  content: string;
}

// 시간표 페이지 데이터 (여러 페이지 관리용)
interface SchedulePageData {
  pageId: number;
  pageName: string;
  teachers: Teacher[];
  nextTeacherId: number;
  schedules: ScheduleCell[];
  timeSettings: {
    startHour: string;
    startMinute: string;
    interval: string;
    timeRows: number;
  };
  dayDates: Record<DayOfWeek, string>;
}

type CreatePageType = "empty" | "copy";

export type { IClassTable, IStudentRowsInClassTable, Teacher, DayOfWeek, ScheduleCell, SchedulePageData, CreatePageType };
