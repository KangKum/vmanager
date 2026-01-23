import Overlay from "./Overlay";
import { useState } from "react";
const SetTimeModal = ({
  setShowTimeModal,
  onApply,
}: {
  setShowTimeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onApply: (hour: string, minute: string, interval: string) => void;
}) => {
  const minuteGap = ["15", "30"];
  const hour = [
    "오전 9",
    "오전 10",
    "오전 11",
    "오후 12",
    "오후 1",
    "오후 2",
    "오후 3",
    "오후 4",
    "오후 5",
    "오후 6",
    "오후 7",
    "오후 8",
    "오후 9",
    "오후 10",
    "오후 11",
  ];
  const minute = ["00", "15", "30", "45"];
  const [startHour, setStartHour] = useState("오전 9");
  const [startMinute, setStartMinute] = useState("00");
  const [interval, setInterval] = useState("15");

  return (
    <>
      <Overlay onClose={() => setShowTimeModal(false)} />
      <div className="w-80 h-60 bg-white border-2 rounded p-2 fixed z-50 top-20 left-20 flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center">
          <div>시작시간</div>
          <div>
            <select className="border p-1" value={startHour} onChange={(e) => setStartHour(e.target.value)}>
              {hour.map((h, index) => (
                <option key={`${h}${index}`} value={h}>
                  {h}시
                </option>
              ))}
            </select>
            <select className="border p-1 ml-2" value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
              {minute.map((m) => (
                <option key={m} value={m}>
                  {m}분
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="mt-2">간격</div>
          <select className="border p-1" value={interval} onChange={(e) => setInterval(e.target.value)}>
            {minuteGap.map((m) => (
              <option key={m} value={m}>
                {m}분
              </option>
            ))}
          </select>
        </div>
        <div className="flex">
          <button
            className="border p-1 m-1"
            onClick={() => {
              onApply(startHour, startMinute, interval);
              setShowTimeModal(false);
            }}
          >
            새로 적용
          </button>
          <button className="border p-1 m-1" onClick={() => setShowTimeModal(false)}>
            기존 유지
          </button>
        </div>
      </div>
    </>
  );
};
export default SetTimeModal;
