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

export type { IClassTable, IStudentRowsInClassTable };
