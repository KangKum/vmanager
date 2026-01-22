import { CiSquarePlus } from "react-icons/ci";
import { useState } from "react";

const Row = ({ idx, onDelete }: { idx: number; onDelete: () => void }) => {
  return (
    <div className="w-full h-7 border-x border-b flex">
      <div className="w-[7%] h-full text-center border-r">{idx + 1}</div>
      <div className="w-[20%] h-full">
        <input className="text-center w-full h-full border-r outline-none" placeholder="홍길동" />
      </div>
      <div className="w-[20%] h-full">
        <input className="text-center w-full h-full border-r outline-none" placeholder="동화중" />
      </div>
      <div className="w-[8%] h-full">
        <input className="text-center w-full h-full border-r outline-none" placeholder="2" />
      </div>
      <div className="w-[40%] h-full">
        <input className="text-center w-full h-full outline-none" placeholder="사유" />
      </div>
      <button className="w-[5%] h-full font-bold border-l" onClick={onDelete}>
        -
      </button>
    </div>
  );
};

const Table = () => {
  const [rows, setRows] = useState<number[]>([]);
  const [nextRowId, setNextRowId] = useState(0);

  const handleAddRow = () => {
    setRows((prev) => [...prev, nextRowId]);
    setNextRowId((prev) => prev + 1);
  };

  const handleDeleteRow = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) setRows((prev) => prev.filter((rowId) => rowId !== id));
  };

  return (
    <div className="w-120 border-t m-2 shrink-0">
      <div className="border-x border-b">
        <input placeholder="1월" className="text-center w-[75%] h-full outline-none" />
        <select className="w-[25%] h-full text-center border-l">
          <option>신입</option>
          <option>중퇴</option>
        </select>
      </div>
      <div className="w-full h-7 border-x border-b flex">
        <div className="w-[7%] h-full text-center border-r">#</div>
        <div className="w-[20%] h-full text-center border-r">이름</div>
        <div className="w-[20%] h-full text-center border-r">학교</div>
        <div className="w-[8%] h-full text-center border-r">학년</div>
        <div className="w-[45%] h-full text-center">사유</div>
      </div>
      {rows.map((rowId, index) => (
        <Row key={rowId} idx={index} onDelete={() => handleDeleteRow(rowId)} />
      ))}
      <button className="flex justify-center items-center" onClick={handleAddRow}>
        <CiSquarePlus size={32} />
      </button>
    </div>
  );
};

const InOutPage = () => {
  const [tables, setTables] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 bg-gray-300">
        <button onClick={() => setTables((prev) => prev + 1)}>테이블 추가</button>
      </div>
      <div className="flex overflow-x-auto overflow-y-auto flex-1">
        {[...Array(tables)].map((_, index) => (
          <Table key={index} />
        ))}
      </div>
    </div>
  );
};

export default InOutPage;
