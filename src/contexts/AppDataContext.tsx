import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '../types/appData';
import { loadData, saveData } from '../services/api';

interface AppDataContextType {
  data: AppData;
  updateData: (section: keyof AppData, newData: any) => void;
  saveToServer: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
}

const defaultData: AppData = {
  elementary: { classes: [], nextId: 0, studentsData: {} },
  middle: { classes: [], nextId: 0, studentsData: {} },
  high: { classes: [], nextId: 0, studentsData: {} },
  schedule: {
    pages: [{
      pageId: 0,
      pageName: "시간표1",
      teachers: [{ id: 0, name: "" }],
      nextTeacherId: 1,
      schedules: [],
      timeSettings: { startHour: "", startMinute: "", interval: "", timeRows: 8 },
      dayDates: { 월: "", 화: "", 수: "", 목: "", 금: "", 토: "", 일: "" }
    }],
    currentPageId: 0,
    nextPageId: 1
  },
  payment: {
    pages: [{
      pageId: 0,
      pageName: "입금명단1",
      tables: {
        elementary: { title: "", rows: [], nextRowId: 0 },
        middle: { title: "", rows: [], nextRowId: 0 },
        high: { title: "", rows: [], nextRowId: 0 }
      }
    }],
    currentPageId: 0,
    nextPageId: 1
  },
  inout: { tables: [], nextTableId: 0 }
};

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const serverData = await loadData();

        // 데이터 마이그레이션: className과 teacher 필드 추가
        const migratedData = {
          ...serverData,
          elementary: {
            ...serverData.elementary,
            classes: serverData.elementary.classes.map(c => ({
              ...c,
              className: c.className || "",
              teacher: c.teacher || ""
            }))
          },
          middle: {
            ...serverData.middle,
            classes: serverData.middle.classes.map(c => ({
              ...c,
              className: c.className || "",
              teacher: c.teacher || ""
            }))
          },
          high: {
            ...serverData.high,
            classes: serverData.high.classes.map(c => ({
              ...c,
              className: c.className || "",
              teacher: c.teacher || ""
            }))
          },
          schedule: {
            ...serverData.schedule,
            // pages가 비어있으면 기본 페이지 추가
            pages: serverData.schedule.pages.length === 0
              ? [{
                  pageId: 0,
                  pageName: "시간표1",
                  teachers: [{ id: 0, name: "" }],
                  nextTeacherId: 1,
                  schedules: [],
                  timeSettings: { startHour: "", startMinute: "", interval: "", timeRows: 8 },
                  dayDates: { 월: "", 화: "", 수: "", 목: "", 금: "", 토: "", 일: "" }
                }]
              : serverData.schedule.pages,
            currentPageId: serverData.schedule.currentPageId || 0,
            nextPageId: serverData.schedule.nextPageId || 1
          },
          payment: {
            ...serverData.payment,
            // pages가 비어있으면 기본 페이지 추가
            pages: serverData.payment.pages.length === 0
              ? [{
                  pageId: 0,
                  pageName: "입금명단1",
                  tables: {
                    elementary: { title: "", rows: [], nextRowId: 0 },
                    middle: { title: "", rows: [], nextRowId: 0 },
                    high: { title: "", rows: [], nextRowId: 0 }
                  }
                }]
              : serverData.payment.pages,
            currentPageId: serverData.payment.currentPageId || 0,
            nextPageId: serverData.payment.nextPageId || 1
          },
          inout: {
            ...serverData.inout,
            tables: serverData.inout.tables || [],
            nextTableId: serverData.inout.nextTableId || 0
          }
        };

        setData(migratedData);
        setLastSaved(serverData.lastSaved ? new Date(serverData.lastSaved) : null);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 실패 시 기본 데이터 사용
      }
    };

    fetchData();
  }, []);

  // 특정 섹션 업데이트
  const updateData = (section: keyof AppData, newData: any) => {
    setData(prev => ({
      ...prev,
      [section]: newData
    }));
  };

  // 서버에 저장
  const saveToServer = async () => {
    setIsSaving(true);
    try {
      const response = await saveData(data);
      setLastSaved(new Date(response.lastSaved));
      alert('저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppDataContext.Provider value={{ data, updateData, saveToServer, isSaving, lastSaved }}>
      {children}
    </AppDataContext.Provider>
  );
};
