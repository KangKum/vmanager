import { useState } from "react";

interface PageTabProps {
  page: { pageId: number; pageName: string };
  isActive: boolean;
  canDelete: boolean;
  onClick: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

const PageTab = ({ page, isActive, canDelete, onClick, onRename, onDelete }: PageTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(page.pageName);
  const [isHovering, setIsHovering] = useState(false);

  const handleSave = () => {
    if (editingName.trim()) {
      onRename(editingName.trim());
    } else {
      setEditingName(page.pageName);
    }
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditingName(page.pageName);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`relative px-4 py-2 border-t border-l border-r cursor-pointer shrink-0 min-w-10 max-w-50 ${
        isActive ? "bg-white border-b-2 border-b-white font-bold" : "bg-gray-200 border-b"
      }`}
      onClick={isEditing ? undefined : onClick}
      onDoubleClick={isEditing ? undefined : handleDoubleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isEditing ? (
        <input
          className="w-full outline-none border-b border-blue-500 px-1"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="truncate">{page.pageName}</span>
          {canDelete && isHovering && (
            <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 font-bold shrink-0">
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageTab;
