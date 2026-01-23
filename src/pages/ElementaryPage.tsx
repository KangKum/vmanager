import ClassTable from "../components/ClassTable";
import { useAppData } from "../hooks/useAppData";
import type { IStudentRowsInClassTable } from "../util/interfaces.ts";
import { useState } from "react";

const ElementaryPage = () => {
  const { data, updateData } = useAppData();
  const elementaryData = data.elementary;

  // 학년 필터 상태 (초등 1~6학년)
  const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const handleDeleteClass = (id: number) => {
    if (confirm("수업을 삭제하시겠습니까?")) {
      const newStudentsData = { ...elementaryData.studentsData };
      delete newStudentsData[id];

      updateData('elementary', {
        ...elementaryData,
        classes: elementaryData.classes.filter((classItem) => classItem.tableId !== id),
        studentsData: newStudentsData
      });
    }
  };

  const handleLevelChange = (tableId: number, newLevel: number) => {
    updateData('elementary', {
      ...elementaryData,
      classes: elementaryData.classes.map((classItem) =>
        classItem.tableId === tableId ? { ...classItem, currentLevel: newLevel } : classItem
      )
    });
  };

  const handleSort = () => {
    const sorted = [...elementaryData.classes].sort((a, b) => a.currentLevel - b.currentLevel);
    const reindexed = sorted.map((classItem, index) => ({ ...classItem, tableId: index }));

    // studentsData도 새 인덱스로 재배치
    const newStudentsData: Record<number, { students: IStudentRowsInClassTable[]; nextStudentId: number }> = {};
    sorted.forEach((classItem, newIndex) => {
      if (elementaryData.studentsData[classItem.tableId]) {
        newStudentsData[newIndex] = elementaryData.studentsData[classItem.tableId];
      }
    });

    updateData('elementary', {
      ...elementaryData,
      classes: reindexed,
      nextId: reindexed.length,
      studentsData: newStudentsData
    });
  };

  const handleAddClass = () => {
    updateData('elementary', {
      ...elementaryData,
      classes: [...elementaryData.classes, { tableId: elementaryData.nextId, currentLevel: 1, className: "", teacher: "" }],
      nextId: elementaryData.nextId + 1,
      studentsData: {
        ...elementaryData.studentsData,
        [elementaryData.nextId]: { students: [], nextStudentId: 0 }
      }
    });
  };

  const handleClassInfoChange = (tableId: number, className: string, teacher: string) => {
    updateData('elementary', {
      ...elementaryData,
      classes: elementaryData.classes.map((classItem) =>
        classItem.tableId === tableId ? { ...classItem, className, teacher } : classItem
      )
    });
  };

  const handleStudentsChange = (tableId: number, students: IStudentRowsInClassTable[], nextStudentId: number) => {
    updateData('elementary', {
      ...elementaryData,
      studentsData: {
        ...elementaryData.studentsData,
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
    if (selectedLevels.length === 6) {
      setSelectedLevels([]);
    } else {
      setSelectedLevels([1, 2, 3, 4, 5, 6]);
    }
  };

  // 필터링된 수업 목록
  const filteredClasses = elementaryData.classes.filter((classItem) =>
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
            checked={selectedLevels.length === 6}
            onChange={handleToggleAll}
          />
          <span>전체</span>
        </label>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <label key={level} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLevels.includes(level)}
              onChange={() => handleToggleLevel(level)}
            />
            <span>E{level}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap">
        {filteredClasses.map((classItem) => (
          <ClassTable
            key={classItem.tableId}
            tableId={classItem.tableId}
            level="E"
            currentLevel={classItem.currentLevel}
            className={classItem.className || ""}
            teacher={classItem.teacher || ""}
            onDeleteClassTable={() => handleDeleteClass(classItem.tableId)}
            onLevelChange={(newLevel) => handleLevelChange(classItem.tableId, newLevel)}
            onClassInfoChange={(className, teacher) => handleClassInfoChange(classItem.tableId, className, teacher)}
            students={elementaryData.studentsData[classItem.tableId]?.students || []}
            nextStudentId={elementaryData.studentsData[classItem.tableId]?.nextStudentId || 0}
            onStudentsChange={(students, nextStudentId) => handleStudentsChange(classItem.tableId, students, nextStudentId)}
          />
        ))}
      </div>
    </div>
  );
};

export default ElementaryPage;
