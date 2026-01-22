import type { DayOfWeek } from "../util/interfaces";

interface TeacherColProps {
  teacherId: number;
  day: DayOfWeek;
  teacherMode: boolean;
  timeRows: number;
  teacherName: string;
  onUpdateName: (name: string) => void;
  onDelete: () => void;
  onUpdateCell: (timeSlot: number, content: string) => void;
  getCellContent: (timeSlot: number) => string;
}

const TeacherCol = ({
  teacherId: _teacherId,
  day: _day,
  teacherMode,
  timeRows,
  teacherName,
  onUpdateName,
  onDelete,
  onUpdateCell,
  getCellContent,
}: TeacherColProps) => {
  return (
    <div className="teacherColumn w-24">
      <div className="nameDiv border flex h-7">
        {teacherMode ? (
          <button className="w-full h-full" onClick={onDelete}>
            X
          </button>
        ) : (
          <input className="w-full h-full outline-none" value={teacherName} onChange={(e) => onUpdateName(e.target.value)} />
        )}
      </div>
      {Array.from({ length: timeRows }).map((_, idx) => (
        <div key={idx} className="border-x border-b w-24 h-7">
          <textarea className="w-full h-full outline-none resize-none" value={getCellContent(idx)} onChange={(e) => onUpdateCell(idx, e.target.value)} />
        </div>
      ))}
    </div>
  );
};
export default TeacherCol;
