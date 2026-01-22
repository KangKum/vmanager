import { useState } from "react";

interface CalendarModalProps {
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const CalendarModal = ({ onSelectDate, onClose }: CalendarModalProps) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 해당 월의 첫 날과 마지막 날 계산
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...
  const daysInMonth = lastDay.getDate();

  // 달력 그리드를 위한 빈 칸과 날짜 배열 생성
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const formattedDate = `${currentMonth + 1}/${day}`;
    onSelectDate(formattedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* 헤더: 년월 선택 */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            &lt;
          </button>
          <div className="font-bold text-lg">
            {currentYear}년 {currentMonth + 1}월
          </div>
          <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            &gt;
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="text-center font-semibold w-10 h-10 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div key={index} className="w-10 h-10">
              {day ? (
                <button
                  onClick={() => handleDateClick(day)}
                  className="w-full h-full flex items-center justify-center hover:bg-blue-100 rounded cursor-pointer border border-gray-300"
                >
                  {day}
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
