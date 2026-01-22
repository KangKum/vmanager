const TeacherCol = ({ id, teacherMode, timeRows, onDelete }: { id: number; teacherMode: boolean; timeRows: number; onDelete: () => void }) => {
  return (
    <div className="teacherColumn w-24">
      <div className="nameDiv border flex h-7">
        {teacherMode ? (
          <button className="w-full h-full" onClick={onDelete}>
            X
          </button>
        ) : (
          <input className={`w-full h-full outline-none`} />
        )}
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
