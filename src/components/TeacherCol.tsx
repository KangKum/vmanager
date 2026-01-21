// import { useState } from "react";

const TeacherCol = ({ teacherMode, timeRows }: { teacherMode: boolean; timeRows: number }) => {
  // const [rowNum, setRowNum] = useState(8);

  return (
    <div className="teacherColumn w-24">
      <div className="nameDiv border flex h-7">
        <input className={`w-full h-full outline-none ${teacherMode ? "text-red-600 font-bold" : ""}`} />
      </div>
      {Array.from({ length: timeRows }).map((_, idx) => (
        <div key={idx} className="border-x border-b w-24 h-7">
          <textarea className="w-full h-full outline-none" />
        </div>
      ))}
    </div>
  );
};
export default TeacherCol;
