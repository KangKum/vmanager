import type { AppData } from '../types/appData';

const API_BASE_URL = 'http://localhost:5001/api';

export const loadData = async (): Promise<AppData> => {
  const response = await fetch(`${API_BASE_URL}/data`);
  if (!response.ok) {
    throw new Error('데이터 로드 실패');
  }
  return response.json();
};

export const saveData = async (data: AppData): Promise<{ success: boolean; lastSaved: string }> => {
  try {
    console.log('저장할 데이터:', data);

    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('서버 에러 응답:', errorText);
      throw new Error(`데이터 저장 실패: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('저장 성공:', result);
    return result;
  } catch (error) {
    console.error('저장 중 에러 발생:', error);
    throw error;
  }
};
