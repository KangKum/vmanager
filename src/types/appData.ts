import type {
  IClassTable,
  IStudentRowsInClassTable,
  SchedulePageData,
  PaymentPageData
} from '../util/interfaces';

// InOutPage 데이터 타입 (새로 정의)
export interface InOutRow {
  id: number;
  name: string;
  school: string;
  grade: string;
  reason: string;
}

export interface InOutTable {
  id: number;
  month: string;           // 월 선택
  type: '신입' | '중퇴';
  rows: InOutRow[];
  nextRowId: number;
}

// ClassTable의 학생 데이터 (새로 정의)
export interface ClassStudentsData {
  students: IStudentRowsInClassTable[];
  nextStudentId: number;
}

// 각 섹션별 데이터 타입
export interface ClassSectionData {
  classes: IClassTable[];
  nextId: number;
  studentsData: Record<number, ClassStudentsData>;  // tableId를 키로 사용
}

export interface ScheduleSectionData {
  pages: SchedulePageData[];
  currentPageId: number;
  nextPageId: number;
}

export interface PaymentSectionData {
  pages: PaymentPageData[];
  currentPageId: number;
  nextPageId: number;
}

export interface InOutSectionData {
  tables: InOutTable[];
  nextTableId: number;
}

// 전체 앱 데이터
export interface AppData {
  elementary: ClassSectionData;
  middle: ClassSectionData;
  high: ClassSectionData;
  schedule: ScheduleSectionData;
  payment: PaymentSectionData;
  inout: InOutSectionData;
  lastSaved?: Date;
}
