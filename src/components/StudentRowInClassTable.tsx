import type { IStudentRowsInClassTable } from "../util/interfaces";
import { useTableNavigation } from "../hooks/useTableNavigation";

interface StudentRowProps {
  idx: number;
  student: IStudentRowsInClassTable;
  rowIndex: number;
  navigation: ReturnType<typeof useTableNavigation>;
  onDeleteStudentRow: () => void;
  onUpdate: (field: keyof IStudentRowsInClassTable, value: string) => void;
}

const StudentRowInClassTable = ({ idx, student, rowIndex, navigation, onDeleteStudentRow, onUpdate }: StudentRowProps) => {
  const fields: (keyof IStudentRowsInClassTable)[] = ['name', 'school', 'grade'];

  return (
    <div className={`flex border-b border-x h-8`}>
      <div className="border-r w-[10%] h-full flex justify-center items-center contentible">{idx + 1}</div>
      {fields.map((field, colIndex) => {
        const isEditing = navigation.editingCell?.row === rowIndex && navigation.editingCell?.col === colIndex;

        return (
          <div
            key={field}
            className={`border-r ${field === 'name' ? 'w-[30%]' : field === 'school' ? 'w-[30%]' : 'w-[20%]'} h-full flex justify-center items-center`}
          >
            <input
              ref={el => {
                if (!navigation.cellRefs.current[rowIndex]) {
                  navigation.cellRefs.current[rowIndex] = [];
                }
                navigation.cellRefs.current[rowIndex][colIndex] = el;
              }}
              value={student[field]}
              readOnly={!isEditing}
              onChange={(e) => onUpdate(field, e.target.value)}
              onKeyDown={(e) => navigation.handleKeyDown(e, rowIndex, colIndex)}
              onFocus={() => navigation.focusCell(rowIndex, colIndex)}
              onDoubleClick={() => navigation.enterEditMode(rowIndex, colIndex)}
              onBlur={() => navigation.exitEditMode()}
              onMouseDown={() => navigation.handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => navigation.handleMouseEnter(rowIndex, colIndex)}
              onMouseUp={() => navigation.handleMouseUp()}
              style={{
                ...navigation.getCellStyle(rowIndex, colIndex),
                cursor: isEditing ? 'text' : 'default',
                userSelect: navigation.isSelecting ? 'none' : 'auto'
              }}
              className="w-full h-full text-center border-0 outline-none"
            />
          </div>
        );
      })}
      <button className="w-[10%] h-full flex justify-center items-center" onClick={onDeleteStudentRow}>
        -
      </button>
    </div>
  );
};
export default StudentRowInClassTable;
