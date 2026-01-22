import { useState } from "react";
import type { CreatePageType } from "../util/interfaces";

interface NewPageModalProps {
  nextPageId: number;
  onClose: () => void;
  onCreate: (name: string, type: CreatePageType) => void;
}

const NewPageModal = ({ nextPageId, onClose, onCreate }: NewPageModalProps) => {
  const [pageName, setPageName] = useState(`시간표${nextPageId + 1}`);
  const [pageType, setPageType] = useState<CreatePageType>("empty");

  const handleCreate = () => {
    if (!pageName.trim()) {
      alert("페이지 이름을 입력해주세요.");
      return;
    }
    onCreate(pageName, pageType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">새 페이지 만들기</h2>

        {/* 페이지 이름 입력 */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">페이지 이름</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="페이지 이름"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>

        {/* 페이지 타입 선택 */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">페이지 타입</label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="pageType"
                value="empty"
                checked={pageType === "empty"}
                onChange={(e) => setPageType(e.target.value as CreatePageType)}
                className="mr-2"
              />
              <span>빈페이지</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="pageType"
                value="copy"
                checked={pageType === "copy"}
                onChange={(e) => setPageType(e.target.value as CreatePageType)}
                className="mr-2"
              />
              <span>현재페이지복사</span>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            취소
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPageModal;
