import type { ScheduleCell, DayOfWeek } from './interfaces';

/**
 * 병합 대상 셀들을 찾는 함수
 * @param schedules 전체 스케줄 배열
 * @param teacherId 선생님 ID
 * @param day 요일
 * @param startTimeSlot 시작 시간 슬롯
 * @param endTimeSlot 종료 시간 슬롯
 * @returns 해당 범위의 셀 배열
 */
export const findMergeCells = (
  schedules: ScheduleCell[],
  teacherId: number,
  day: DayOfWeek,
  startTimeSlot: number,
  endTimeSlot: number
): ScheduleCell[] => {
  return schedules.filter(cell =>
    cell.teacherId === teacherId &&
    cell.day === day &&
    cell.timeSlot >= startTimeSlot &&
    cell.timeSlot <= endTimeSlot
  );
};

/**
 * 병합 시 사용할 텍스트를 결정하는 함수
 * 맨 위 셀부터 순서대로 비어있지 않은 첫 번째 텍스트를 반환
 * @param cells 병합 대상 셀 배열
 * @returns 병합된 셀에 사용할 텍스트
 */
export const getMergedText = (cells: ScheduleCell[]): string => {
  const sorted = cells
    .filter(c => c.content.trim() !== '')
    .sort((a, b) => a.timeSlot - b.timeSlot);

  return sorted.length > 0 ? sorted[0].content : '';
};

/**
 * 선택 범위에 이미 병합된 셀이 포함되어 있는지 검사하는 함수
 * @param schedules 전체 스케줄 배열
 * @param teacherId 선생님 ID
 * @param day 요일
 * @param startTimeSlot 시작 시간 슬롯
 * @param endTimeSlot 종료 시간 슬롯
 * @returns 겹치는 병합이 있으면 true, 없으면 false
 */
export const hasOverlappingMerge = (
  schedules: ScheduleCell[],
  teacherId: number,
  day: DayOfWeek,
  startTimeSlot: number,
  endTimeSlot: number
): boolean => {
  // 선택 범위 내에 병합된 셀이 있는지 체크
  const hasInRange = schedules.some(cell =>
    cell.teacherId === teacherId &&
    cell.day === day &&
    cell.timeSlot >= startTimeSlot &&
    cell.timeSlot <= endTimeSlot &&
    ((cell.rowspan && cell.rowspan > 1) || cell.isMergedChild)
  );

  if (hasInRange) return true;

  // 선택 범위 위에서 시작된 병합셀이 선택 범위로 확장되는지 체크
  const cellsAbove = schedules.filter(cell =>
    cell.teacherId === teacherId &&
    cell.day === day &&
    cell.timeSlot < startTimeSlot &&
    cell.rowspan &&
    cell.rowspan > 1
  );

  for (const cell of cellsAbove) {
    if (cell.rowspan) {
      const mergeEndSlot = cell.timeSlot + cell.rowspan - 1;
      if (mergeEndSlot >= startTimeSlot) {
        return true; // 병합셀이 선택 범위로 확장됨
      }
    }
  }

  return false;
};
