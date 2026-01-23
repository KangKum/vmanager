interface IClassTable {
  tableId: number;
  currentLevel: number;
  className: string;
  teacher: string;
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
  rowspan?: number;        // 병합된 셀이 차지하는 행 수 (기본값: 1)
  isMergedChild?: boolean; // 병합에 포함된 자식 셀 여부 (렌더링 스킵용)
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

// 입금명단 관리용 타입들
interface PaymentRow {
  id: number;
  name: string;
  school: string;
  grade: string;
  paymentDate: string;
  vehicle: string;
  tuition: string;
  notes: string;
}

interface PaymentTable {
  title: string;
  rows: PaymentRow[];
  nextRowId: number;
}

interface PaymentPageData {
  pageId: number;
  pageName: string;
  tables: {
    elementary: PaymentTable;
    middle: PaymentTable;
    high: PaymentTable;
  };
}

export type { IClassTable, IStudentRowsInClassTable, Teacher, DayOfWeek, ScheduleCell, SchedulePageData, CreatePageType, PaymentRow, PaymentTable, PaymentPageData };
