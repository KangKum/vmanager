import { CiSquarePlus } from "react-icons/ci";
import { useState, useMemo } from "react";
import NewPageModal from "../components/NewPageModal";
import PageTab from "../components/PageTab";
import { useAppData } from "../hooks/useAppData";
import type { PaymentRow, PaymentTable, PaymentPageData, CreatePageType } from "../util/interfaces";
import { useTableNavigation } from "../hooks/useTableNavigation";

interface RowProps {
  idx: number;
  rowData: PaymentRow;
  rowIndex: number;
  navigation: ReturnType<typeof useTableNavigation>;
  onDelete: () => void;
  onUpdate: (field: keyof PaymentRow, value: string) => void;
}

const Row = ({ idx, rowData, rowIndex, navigation, onDelete, onUpdate }: RowProps) => {
  const fields: (keyof PaymentRow)[] = ['name', 'school', 'grade', 'paymentDate', 'vehicle', 'tuition', 'notes'];
  const widths = ['12%', '15%', '10%', '12%', '10%', '12%', '20%'];

  return (
    <div className="w-full h-7 border-x border-b flex">
      <div className="w-[6%] h-full text-center border-r">{idx + 1}</div>
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
              value={rowData[field]}
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
              className={`text-center w-full h-full ${colIndex < 6 ? 'border-r' : ''} outline-none`}
            />
          </div>
        );
      })}
      <button className="w-[3%] h-full font-bold border-l" onClick={onDelete}>
        -
      </button>
    </div>
  );
};

interface TableProps {
  grade: string;
  tableData: PaymentTable;
  onAddRow: () => void;
  onDeleteRow: (rowId: number) => void;
  onUpdateRow: (rowId: number, field: keyof PaymentRow, value: string) => void;
  onUpdateTitle: (title: string) => void;
}

const Table = ({ grade, tableData, onAddRow, onDeleteRow, onUpdateRow, onUpdateTitle }: TableProps) => {
  const navigation = useTableNavigation({
    rows: tableData.rows.length,
    cols: 7,
    onClearCells: (cells) => {
      const fieldMap = ['name', 'school', 'grade', 'paymentDate', 'vehicle', 'tuition', 'notes'] as const;

      cells.forEach(({ row, col }) => {
        if (row >= 0 && row < tableData.rows.length && col >= 0 && col < 7) {
          const field = fieldMap[col];
          const rowData = tableData.rows[row];
          if (rowData) {
            onUpdateRow(rowData.id, field, '');
          }
        }
      });
    }
  });

  return (
    <div className="w-200 border-t m-2 shrink-0">
      <div className="border-x border-b h-10">
        <input
          placeholder={`1월 ${grade}`}
          value={tableData.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="text-center w-full h-full text-xl outline-none"
        />
      </div>
      <div className="w-full h-8 border-x border-b flex">
        <div className="w-[6%] h-full text-center flex justify-center items-center border-r">#</div>
        <div className="w-[12%] h-full text-center flex justify-center items-center border-r">이름</div>
        <div className="w-[15%] h-full text-center flex justify-center items-center border-r">학교</div>
        <div className="w-[10%] h-full text-center flex justify-center items-center border-r">학년</div>
        <div className="w-[12%] h-full text-center flex justify-center items-center border-r">결제일</div>
        <div className="w-[10%] h-full text-center flex justify-center items-center border-r">차량</div>
        <div className="w-[12%] h-full text-center flex justify-center items-center border-r">수업료</div>
        <div className="w-[23%] h-full text-center flex justify-center items-center">비고</div>
      </div>
      {tableData.rows.map((row, index) => (
        <Row
          key={row.id}
          idx={index}
          rowData={row}
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

const PaymentPage = () => {
  const { data, updateData } = useAppData();
  const paymentData = data.payment;
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  // 현재 페이지 조회
  const currentPage = useMemo(() => {
    const page = paymentData.pages.find((p) => p.pageId === paymentData.currentPageId);
    if (!page) {
      return paymentData.pages[0];
    }
    return page;
  }, [paymentData]);

  // 현재 페이지 업데이트 헬퍼
  const updateCurrentPage = (updater: (page: PaymentPageData) => PaymentPageData) => {
    updateData("payment", {
      ...paymentData,
      pages: paymentData.pages.map((page) => (page.pageId === paymentData.currentPageId ? updater(page) : page)),
    });
  };

  // 빈 페이지 생성 함수
  const createEmptyPage = (id: number, name: string): PaymentPageData => ({
    pageId: id,
    pageName: name,
    tables: {
      elementary: { title: "", rows: [], nextRowId: 0 },
      middle: { title: "", rows: [], nextRowId: 0 },
      high: { title: "", rows: [], nextRowId: 0 },
    },
  });

  // 페이지 복사 함수 (깊은 복사)
  const createCopyPage = (source: PaymentPageData, newId: number, newName: string): PaymentPageData => ({
    pageId: newId,
    pageName: newName,
    tables: {
      elementary: {
        title: source.tables.elementary.title,
        rows: source.tables.elementary.rows.map((r) => ({ ...r })),
        nextRowId: source.tables.elementary.nextRowId,
      },
      middle: {
        title: source.tables.middle.title,
        rows: source.tables.middle.rows.map((r) => ({ ...r })),
        nextRowId: source.tables.middle.nextRowId,
      },
      high: {
        title: source.tables.high.title,
        rows: source.tables.high.rows.map((r) => ({ ...r })),
        nextRowId: source.tables.high.nextRowId,
      },
    },
  });

  // 페이지 관리 함수들
  const handleCreatePage = (name: string, type: CreatePageType) => {
    const newPage: PaymentPageData =
      type === "empty" ? createEmptyPage(paymentData.nextPageId, name) : createCopyPage(currentPage, paymentData.nextPageId, name);

    updateData("payment", {
      ...paymentData,
      pages: [...paymentData.pages, newPage],
      currentPageId: paymentData.nextPageId,
      nextPageId: paymentData.nextPageId + 1,
    });
    setShowNewPageModal(false);
  };

  const handleDeletePage = (pageId: number) => {
    if (paymentData.pages.length === 1) {
      alert("마지막 페이지는 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("페이지를 삭제하시겠습니까?")) return;

    const remainingPages = paymentData.pages.filter((p) => p.pageId !== pageId);

    updateData("payment", {
      ...paymentData,
      pages: remainingPages,
      currentPageId: paymentData.currentPageId === pageId ? remainingPages[0].pageId : paymentData.currentPageId,
    });
  };

  const handleRenamePage = (pageId: number, newName: string) => {
    updateData("payment", {
      ...paymentData,
      pages: paymentData.pages.map((page) => (page.pageId === pageId ? { ...page, pageName: newName } : page)),
    });
  };

  const handleSwitchPage = (pageId: number) => {
    updateData("payment", {
      ...paymentData,
      currentPageId: pageId,
    });
  };

  // 테이블별 CRUD 함수들
  const handleAddRow = (tableType: "elementary" | "middle" | "high") => {
    updateCurrentPage((page) => {
      const table = page.tables[tableType];
      return {
        ...page,
        tables: {
          ...page.tables,
          [tableType]: {
            ...table,
            rows: [
              ...table.rows,
              {
                id: table.nextRowId,
                name: "",
                school: "",
                grade: "",
                paymentDate: "",
                vehicle: "",
                tuition: "",
                notes: "",
              },
            ],
            nextRowId: table.nextRowId + 1,
          },
        },
      };
    });
  };

  const handleDeleteRow = (tableType: "elementary" | "middle" | "high", rowId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    updateCurrentPage((page) => ({
      ...page,
      tables: {
        ...page.tables,
        [tableType]: {
          ...page.tables[tableType],
          rows: page.tables[tableType].rows.filter((r) => r.id !== rowId),
        },
      },
    }));
  };

  const handleUpdateRow = (tableType: "elementary" | "middle" | "high", rowId: number, field: keyof PaymentRow, value: string) => {
    updateCurrentPage((page) => ({
      ...page,
      tables: {
        ...page.tables,
        [tableType]: {
          ...page.tables[tableType],
          rows: page.tables[tableType].rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
        },
      },
    }));
  };

  const handleUpdateTableTitle = (tableType: "elementary" | "middle" | "high", title: string) => {
    updateCurrentPage((page) => ({
      ...page,
      tables: {
        ...page.tables,
        [tableType]: {
          ...page.tables[tableType],
          title,
        },
      },
    }));
  };

  // 학생 데이터를 PaymentPage로 업데이트하는 함수
  const handleUpdateStudents = () => {
    // 각 학년별 학생 데이터 수집
    const elementaryStudents: PaymentRow[] = [];
    const middleStudents: PaymentRow[] = [];
    const highStudents: PaymentRow[] = [];

    // 초등 학생 수집
    Object.values(data.elementary.studentsData).forEach((classData) => {
      classData.students.forEach((student) => {
        elementaryStudents.push({
          id: currentPage.tables.elementary.nextRowId + elementaryStudents.length,
          name: student.name,
          school: student.school,
          grade: student.grade,
          paymentDate: "",
          vehicle: "",
          tuition: "",
          notes: "",
        });
      });
    });

    // 중등 학생 수집
    Object.values(data.middle.studentsData).forEach((classData) => {
      classData.students.forEach((student) => {
        middleStudents.push({
          id: currentPage.tables.middle.nextRowId + middleStudents.length,
          name: student.name,
          school: student.school,
          grade: student.grade,
          paymentDate: "",
          vehicle: "",
          tuition: "",
          notes: "",
        });
      });
    });

    // 고등 학생 수집
    Object.values(data.high.studentsData).forEach((classData) => {
      classData.students.forEach((student) => {
        highStudents.push({
          id: currentPage.tables.high.nextRowId + highStudents.length,
          name: student.name,
          school: student.school,
          grade: student.grade,
          paymentDate: "",
          vehicle: "",
          tuition: "",
          notes: "",
        });
      });
    });

    // 이름 오름차순 정렬
    elementaryStudents.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
    middleStudents.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
    highStudents.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));

    // 현재 페이지에 학생 데이터 추가
    updateCurrentPage((page) => ({
      ...page,
      tables: {
        elementary: {
          ...page.tables.elementary,
          rows: [...page.tables.elementary.rows, ...elementaryStudents],
          nextRowId: page.tables.elementary.nextRowId + elementaryStudents.length,
        },
        middle: {
          ...page.tables.middle,
          rows: [...page.tables.middle.rows, ...middleStudents],
          nextRowId: page.tables.middle.nextRowId + middleStudents.length,
        },
        high: {
          ...page.tables.high,
          rows: [...page.tables.high.rows, ...highStudents],
          nextRowId: page.tables.high.nextRowId + highStudents.length,
        },
      },
    }));

    alert(`업데이트 완료!\n초등: ${elementaryStudents.length}명\n중등: ${middleStudents.length}명\n고등: ${highStudents.length}명`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 페이지 탭 영역 */}
      <div className="flex items-end bg-gray-100 border-b">
        <button onClick={() => setShowNewPageModal(true)} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 shrink-0">
          + 새페이지
        </button>
        {paymentData.pages.map((page) => (
          <PageTab
            key={page.pageId}
            page={page}
            isActive={page.pageId === paymentData.currentPageId}
            canDelete={paymentData.pages.length > 1}
            onClick={() => handleSwitchPage(page.pageId)}
            onRename={(name) => handleRenamePage(page.pageId, name)}
            onDelete={() => handleDeletePage(page.pageId)}
          />
        ))}
      </div>

      {/* 기능 버튼 영역 */}
      <div className="bg-gray-300 p-2">
        <button onClick={handleUpdateStudents} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          학생 데이터 업데이트
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="flex">
        <Table
          grade="초등"
          tableData={currentPage.tables.elementary}
          onAddRow={() => handleAddRow("elementary")}
          onDeleteRow={(id) => handleDeleteRow("elementary", id)}
          onUpdateRow={(id, field, value) => handleUpdateRow("elementary", id, field, value)}
          onUpdateTitle={(title) => handleUpdateTableTitle("elementary", title)}
        />
        <Table
          grade="중등"
          tableData={currentPage.tables.middle}
          onAddRow={() => handleAddRow("middle")}
          onDeleteRow={(id) => handleDeleteRow("middle", id)}
          onUpdateRow={(id, field, value) => handleUpdateRow("middle", id, field, value)}
          onUpdateTitle={(title) => handleUpdateTableTitle("middle", title)}
        />
        <Table
          grade="고등"
          tableData={currentPage.tables.high}
          onAddRow={() => handleAddRow("high")}
          onDeleteRow={(id) => handleDeleteRow("high", id)}
          onUpdateRow={(id, field, value) => handleUpdateRow("high", id, field, value)}
          onUpdateTitle={(title) => handleUpdateTableTitle("high", title)}
        />
      </div>

      {/* 모달 */}
      {showNewPageModal && <NewPageModal onClose={() => setShowNewPageModal(false)} onCreate={handleCreatePage} />}
    </div>
  );
};

export default PaymentPage;
