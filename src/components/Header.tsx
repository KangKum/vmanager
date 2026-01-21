import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-red-200 flex gap-4 px-2">
      <button onClick={() => navigate("/")}>홈</button>
      <button onClick={() => navigate("/elementary")}>초등</button>
      <button onClick={() => navigate("/middle")}>중등</button>
      <button onClick={() => navigate("/high")}>고등</button>
      <button onClick={() => navigate("/schedule")}>시간표</button>
      <button onClick={() => navigate("/inout")}>신입중퇴</button>
      <button onClick={() => navigate("/payment")}>입금명단</button>
      <button>인쇄</button>
      <button>저장</button>
    </header>
  );
};
export default Header;
