import StudentRowInClassTable from "./StudentRowInClassTable";
import { TiDeleteOutline } from "react-icons/ti";
import { useState } from "react";
import type { IStudentRowsInClassTable } from "../util/interfaces.ts";

const ClassTable = ({
  tableId,
  level,
  currentLevel,
  onDeleteClassTable,
  onLevelChange,
}: {
  tableId: number;
  level: string;
  currentLevel: number;
  onDeleteClassTable: () => void;
  onLevelChange: (newLevel: number) => void;
}) => {
  const [studentRows, setStudentRows] = useState<IStudentRowsInClassTable[]>([]);
  const [nextStudentId, setNextStudentId] = useState(0);

  const handleAddStudent = () => {
    setStudentRows((prev) => [...prev, { studentId: nextStudentId, idx: prev.length, name: "", school: "", grade: "" }]);
    setNextStudentId((prev) => prev + 1);
  };

  const handleDeleteStudent = (id: number) => {
    if (confirm("학생을 삭제하시겠습니까?")) {
      setStudentRows((prev) => prev.filter((student) => student.studentId !== id));
    }
  };

  const handleLevelClick = () => {
    // level이 "E"이면 1~6 순환, 아니면("M", "H") 1~3 순환
    const maxLevel = level === "E" ? 6 : 3;
    const newLevel = (currentLevel % maxLevel) + 1;
    onLevelChange(newLevel);
  };

  return (
    <div className={`flex flex-col w-[22%] mx-[1.5%] my-3`}>
      <div className="border h-8 text-lg flex">
        <button className="levelBtn w-[10%] font-bold" onClick={handleLevelClick}>
          {currentLevel}
        </button>
        <div className="w-[80%] h-full flex justify-center items-center">
          <input className="w-full h-full text-center border-0 outline-none" placeholder="반이름" />
        </div>
        <button className="w-[10%] h-full font-bold flex justify-center items-center" onClick={onDeleteClassTable}>
          <TiDeleteOutline />
        </button>
      </div>
      <div className="border-b border-x h-8 flex justify-center items-center">
        <input className="w-full h-full text-center border-0 outline-none" placeholder="수업시간/담당선생님" />
      </div>
      <div className="flex border-b border-x h-7">
        <div className="border-r w-[10%] h-full flex justify-center items-center">#</div>
        <div className="border-r w-[30%] h-full flex justify-center items-center">이름</div>
        <div className="border-r w-[30%] h-full flex justify-center items-center">학교</div>
        <div className="border-r w-[20%] h-full flex justify-center items-center">학년</div>
        <div className="w-[10%] h-full flex justify-center items-center"></div>
      </div>
      {studentRows.map((student, index) => (
        <StudentRowInClassTable
          key={student.studentId}
          tableId={tableId}
          studentId={student.studentId}
          idx={index}
          onDeleteStudentRow={() => handleDeleteStudent(student.studentId)}
        />
      ))}
      <button className="border-b border-x bg-gray-300" onClick={handleAddStudent}>
        학생 추가
      </button>
    </div>
  );
};

export default ClassTable;
