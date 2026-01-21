import ClassTable from "../components/ClassTable";
import { useState } from "react";
import type { IClassTable } from "../util/interfaces.ts";

const MiddlePage = () => {
  const [middleClasses, setMiddleClasses] = useState<IClassTable[]>([]);
  const [nextId, setNextId] = useState(0);

  const handleDeleteClass = (id: number) => {
    if (confirm("수업을 삭제하시겠습니까?")) setMiddleClasses((prev) => prev.filter((classItem) => classItem.tableId !== id));
  };

  const handleLevelChange = (tableId: number, newLevel: number) => {
    setMiddleClasses((prev) => prev.map((classItem) => (classItem.tableId === tableId ? { ...classItem, currentLevel: newLevel } : classItem)));
  };

  const handleSort = () => {
    setMiddleClasses((prev) => {
      const sorted = [...prev].sort((a, b) => a.currentLevel - b.currentLevel);
      return sorted.map((classItem, index) => ({ ...classItem, tableId: index }));
    });
    setNextId(middleClasses.length);
  };

  // isSorted가 true일 때만 정렬
  const displayClasses = middleClasses;

  return (
    <div className="w-full flex flex-col">
      <button
        className="bg-gray-300 p-2 cursor-pointer"
        onClick={() => {
          setMiddleClasses((prev) => [...prev, { tableId: nextId, currentLevel: 1 }]);
          setNextId((prev) => prev + 1);
        }}
      >
        수업 개설
      </button>
      <button className="bg-gray-300 p-2 cursor-pointer" onClick={handleSort}>
        정렬
      </button>

      <div className="flex flex-wrap">
        {displayClasses.map((classItem) => (
          <ClassTable
            key={classItem.tableId}
            tableId={classItem.tableId}
            level="M"
            currentLevel={classItem.currentLevel}
            onDeleteClassTable={() => handleDeleteClass(classItem.tableId)}
            onLevelChange={(newLevel) => handleLevelChange(classItem.tableId, newLevel)}
          />
        ))}
      </div>
    </div>
  );
};

export default MiddlePage;
