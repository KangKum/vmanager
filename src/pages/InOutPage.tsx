import { CiSquarePlus } from "react-icons/ci";
import { useAppData } from "../hooks/useAppData";
import { useTableNavigation } from "../hooks/useTableNavigation";
import type { InOutRow, InOutTable } from "../types/appData";

interface RowProps {
  idx: number;
  row: InOutRow;
  rowIndex: number;
  navigation: ReturnType<typeof useTableNavigation>;
  onDelete: () => void;
  onUpdate: (field: keyof InOutRow, value: string) => void;
}

const Row = ({ idx, row, rowIndex, navigation, onDelete, onUpdate }: RowProps) => {
  const fields: (keyof InOutRow)[] = ['name', 'school', 'grade', 'reason'];
  const widths = ['20%', '20%', '8%', '40%'];

  return (
    <div className="w-full h-7 border-x border-b flex">
      <div className="w-[7%] h-full text-center border-r">{idx + 1}</div>
      {fields.map((field, colIndex) => {
        const isEditing = navigation.editingCell?.row === rowIndex && navigation.editingCell?.col === colIndex;

        return (
          <div key={field} className={`w-[${widths[colIndex]}] h-full`}>
            <input
              ref={el => {
                if (!navigation.cellRefs.current[rowIndex]) {
                  navigation.cellRefs.current[rowIndex] = [];
                }
                navigation.cellRefs.current[rowIndex][colIndex] = el;
              }}
              value={row[field]}
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
              className={`text-center w-full h-full ${colIndex < 3 ? 'border-r' : ''} outline-none`}
              placeholder={field === 'name' ? '홍길동' : field === 'school' ? '동화중' : field === 'grade' ? '2' : '사유'}
            />
          </div>
        );
      })}
      <button className="w-[5%] h-full font-bold border-l" onClick={onDelete}>
        -
      </button>
    </div>
  );
};

interface TableProps {
  table: InOutTable;
  onUpdateMonth: (month: string) => void;
  onUpdateType: (type: '신입' | '중퇴') => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: number) => void;
  onUpdateRow: (rowId: number, field: keyof InOutRow, value: string) => void;
  onDeleteTable: () => void;
}

const Table = ({
  table,
  onUpdateMonth,
  onUpdateType,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onDeleteTable
}: TableProps) => {
  const navigation = useTableNavigation({
    rows: table.rows.length,
    cols: 4,
    onClearCells: (cells) => {
      const fieldMap = ['name', 'school', 'grade', 'reason'] as const;

      cells.forEach(({ row, col }) => {
        if (row >= 0 && row < table.rows.length && col >= 0 && col < 4) {
          const field = fieldMap[col];
          const rowData = table.rows[row];
          if (rowData) {
            onUpdateRow(rowData.id, field, '');
          }
        }
      });
    }
  });

  return (
    <div className="w-120 border-t m-2 shrink-0">
      <div className="border-x border-b h-8 flex">
        <input
          value={table.month}
          onChange={(e) => onUpdateMonth(e.target.value)}
          placeholder="1월"
          className="text-center w-[70%] h-full outline-none"
        />
        <select
          value={table.type}
          onChange={(e) => onUpdateType(e.target.value as '신입' | '중퇴')}
          className="w-[20%] h-full text-center border-l"
        >
          <option value="신입">신입</option>
          <option value="중퇴">중퇴</option>
        </select>
        <button
          onClick={onDeleteTable}
          className="w-[10%] h-full font-bold border-l hover:bg-red-100"
        >
          삭제
        </button>
      </div>
      <div className="w-full h-7 border-x border-b flex">
        <div className="w-[7%] h-full text-center border-r">#</div>
        <div className="w-[20%] h-full text-center border-r">이름</div>
        <div className="w-[20%] h-full text-center border-r">학교</div>
        <div className="w-[8%] h-full text-center border-r">학년</div>
        <div className="w-[45%] h-full text-center">사유</div>
      </div>
      {table.rows.map((row, index) => (
        <Row
          key={row.id}
          idx={index}
          row={row}
          rowIndex={index}
          navigation={navigation}
          onDelete={() => onDeleteRow(row.id)}
          onUpdate={(field, value) => onUpdateRow(row.id, field, value)}
        />
      ))}
      <button className="flex justify-center items-center" onClick={onAddRow}>
        <CiSquarePlus size={32} />
      </button>
    </div>
  );
};

const InOutPage = () => {
  const { data, updateData } = useAppData();
  const inoutData = data.inout;

  // 테이블 추가
  const handleAddTable = () => {
    const newTable: InOutTable = {
      id: inoutData.nextTableId,
      month: "",
      type: "신입",
      rows: [],
      nextRowId: 0
    };

    updateData('inout', {
      ...inoutData,
      tables: [...inoutData.tables, newTable],
      nextTableId: inoutData.nextTableId + 1
    });
  };

  // 테이블 삭제
  const handleDeleteTable = (tableId: number) => {
    if (!confirm("테이블을 삭제하시겠습니까?")) return;

    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.filter(t => t.id !== tableId)
    });
  };

  // 테이블의 월 업데이트
  const handleUpdateMonth = (tableId: number, month: string) => {
    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.map(table =>
        table.id === tableId ? { ...table, month } : table
      )
    });
  };

  // 테이블의 타입 업데이트
  const handleUpdateType = (tableId: number, type: '신입' | '중퇴') => {
    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.map(table =>
        table.id === tableId ? { ...table, type } : table
      )
    });
  };

  // 행 추가
  const handleAddRow = (tableId: number) => {
    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: [...table.rows, {
                id: table.nextRowId,
                name: "",
                school: "",
                grade: "",
                reason: ""
              }],
              nextRowId: table.nextRowId + 1
            }
          : table
      )
    });
  };

  // 행 삭제
  const handleDeleteRow = (tableId: number, rowId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: table.rows.filter(row => row.id !== rowId)
            }
          : table
      )
    });
  };

  // 행 데이터 업데이트
  const handleUpdateRow = (tableId: number, rowId: number, field: keyof InOutRow, value: string) => {
    updateData('inout', {
      ...inoutData,
      tables: inoutData.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              rows: table.rows.map(row =>
                row.id === rowId ? { ...row, [field]: value } : row
              )
            }
          : table
      )
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 bg-gray-300">
        <button onClick={handleAddTable}>테이블 추가</button>
      </div>
      <div className="flex overflow-x-auto overflow-y-auto flex-1">
        {inoutData.tables.map((table) => (
          <Table
            key={table.id}
            table={table}
            onUpdateMonth={(month) => handleUpdateMonth(table.id, month)}
            onUpdateType={(type) => handleUpdateType(table.id, type)}
            onAddRow={() => handleAddRow(table.id)}
            onDeleteRow={(rowId) => handleDeleteRow(table.id, rowId)}
            onUpdateRow={(rowId, field, value) => handleUpdateRow(table.id, rowId, field, value)}
            onDeleteTable={() => handleDeleteTable(table.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default InOutPage;
