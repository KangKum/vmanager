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

export type { IClassTable, IStudentRowsInClassTable, Teacher, DayOfWeek, ScheduleCell };
