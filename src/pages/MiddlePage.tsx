import ClassTable from "../components/ClassTable";
import { useAppData } from "../hooks/useAppData";
import type { IStudentRowsInClassTable } from "../util/interfaces.ts";
import { useState } from "react";

const MiddlePage = () => {
  const { data, updateData } = useAppData();
  const middleData = data.middle;

  // 학년 필터 상태 (중등 1~3학년)
  const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2, 3]);

  const handleDeleteClass = (id: number) => {
    if (confirm("수업을 삭제하시겠습니까?")) {
      const newStudentsData = { ...middleData.studentsData };
      delete newStudentsData[id];

      updateData('middle', {
        ...middleData,
        classes: middleData.classes.filter((classItem) => classItem.tableId !== id),
        studentsData: newStudentsData
      });
    }
  };

  const handleLevelChange = (tableId: number, newLevel: number) => {
    updateData('middle', {
      ...middleData,
      classes: middleData.classes.map((classItem) =>
        classItem.tableId === tableId ? { ...classItem, currentLevel: newLevel } : classItem
      )
    });
  };

  const handleSort = () => {
    const sorted = [...middleData.classes].sort((a, b) => a.currentLevel - b.currentLevel);
    const reindexed = sorted.map((classItem, index) => ({ ...classItem, tableId: index }));

    // studentsData도 새 인덱스로 재배치
    const newStudentsData: Record<number, { students: IStudentRowsInClassTable[]; nextStudentId: number }> = {};
    sorted.forEach((classItem, newIndex) => {
      if (middleData.studentsData[classItem.tableId]) {
        newStudentsData[newIndex] = middleData.studentsData[classItem.tableId];
      }
    });

    updateData('middle', {
      ...middleData,
      classes: reindexed,
      nextId: reindexed.length,
      studentsData: newStudentsData
    });
  };

  const handleAddClass = () => {
    updateData('middle', {
      ...middleData,
      classes: [...middleData.classes, { tableId: middleData.nextId, currentLevel: 1, className: "", teacher: "" }],
      nextId: middleData.nextId + 1,
      studentsData: {
        ...middleData.studentsData,
        [middleData.nextId]: { students: [], nextStudentId: 0 }
      }
    });
  };

  const handleClassInfoChange = (tableId: number, className: string, teacher: string) => {
    updateData('middle', {
      ...middleData,
      classes: middleData.classes.map((classItem) =>
        classItem.tableId === tableId ? { ...classItem, className, teacher } : classItem
      )
    });
  };

  const handleStudentsChange = (tableId: number, students: IStudentRowsInClassTable[], nextStudentId: number) => {
    updateData('middle', {
      ...middleData,
      studentsData: {
        ...middleData.studentsData,
        [tableId]: { students, nextStudentId }
      }
    });
  };

  // 학년 필터 토글
  const handleToggleLevel = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // 전체 선택/해제
  const handleToggleAll = () => {
    if (selectedLevels.length === 3) {
      setSelectedLevels([]);
    } else {
      setSelectedLevels([1, 2, 3]);
    }
  };

  // 필터링된 수업 목록
  const filteredClasses = middleData.classes.filter((classItem) =>
    selectedLevels.includes(classItem.currentLevel)
  );

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex gap-2">
        <button className="bg-gray-300 p-2" onClick={handleAddClass}>
          수업 개설
        </button>
        <button className="bg-gray-300 p-2" onClick={handleSort}>
          정렬
        </button>
      </div>

      {/* 학년 필터 */}
      <div className="bg-gray-100 p-2 flex gap-3 items-center flex-wrap">
        <span className="font-bold">학년 필터:</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedLevels.length === 3}
            onChange={handleToggleAll}
          />
          <span>전체</span>
        </label>
        {[1, 2, 3].map((level) => (
          <label key={level} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLevels.includes(level)}
              onChange={() => handleToggleLevel(level)}
            />
            <span>M{level}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap">
        {filteredClasses.map((classItem) => (
          <ClassTable
            key={classItem.tableId}
            tableId={classItem.tableId}
            level="M"
            currentLevel={classItem.currentLevel}
            className={classItem.className || ""}
            teacher={classItem.teacher || ""}
            onDeleteClassTable={() => handleDeleteClass(classItem.tableId)}
            onLevelChange={(newLevel) => handleLevelChange(classItem.tableId, newLevel)}
            onClassInfoChange={(className, teacher) => handleClassInfoChange(classItem.tableId, className, teacher)}
            students={middleData.studentsData[classItem.tableId]?.students || []}
            nextStudentId={middleData.studentsData[classItem.tableId]?.nextStudentId || 0}
            onStudentsChange={(students, nextStudentId) => handleStudentsChange(classItem.tableId, students, nextStudentId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MiddlePage;
