const StudentRowInClassTable = ({ idx, onDeleteStudentRow }: { tableId: number; studentId: number; idx: number; onDeleteStudentRow: () => void }) => {
  return (
    <div className={`flex border-b border-x h-8`}>
      <div className="border-r w-[10%] h-full flex justify-center items-center contentible">{idx + 1}</div>
      <div className="border-r w-[30%] h-full flex justify-center items-center">
        <input className="w-full h-full text-center border-0 outline-none" />
      </div>
      <div className="border-r w-[30%] h-full flex justify-center items-center">
        <input className="w-full h-full text-center border-0 outline-none" />
      </div>
      <div className="border-r w-[20%] h-full flex justify-center items-center">
        <input className="w-full h-full text-center border-0 outline-none" />
      </div>
      <button className="w-[10%] h-full flex justify-center items-center cursor-pointer" onClick={onDeleteStudentRow}>
        -
      </button>
    </div>
  );
};
export default StudentRowInClassTable;
