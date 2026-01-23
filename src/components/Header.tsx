import { useNavigate } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";

const Header = () => {
  const navigate = useNavigate();
  const { saveToServer, isSaving, lastSaved } = useAppData();

  return (
    <header className="bg-red-200 flex gap-4 px-2 h-[6%] items-center">
      <button onClick={() => navigate("/")}>홈</button>
      <button onClick={() => navigate("/elementary")}>초등</button>
      <button onClick={() => navigate("/middle")}>중등</button>
      <button onClick={() => navigate("/high")}>고등</button>
      <button onClick={() => navigate("/schedule")}>시간표</button>
      <button onClick={() => navigate("/inout")}>신입중퇴</button>
      <button onClick={() => navigate("/payment")}>입금명단</button>
      <button>인쇄</button>
      <button
        onClick={saveToServer}
        disabled={isSaving}
        className={isSaving ? "opacity-50 cursor-not-allowed" : ""}
      >
        {isSaving ? "저장 중..." : "저장"}
      </button>
      {lastSaved && (
        <span className="text-sm">
          마지막 저장: {lastSaved.toLocaleString()}
        </span>
      )}
    </header>
  );
};

export default Header;
