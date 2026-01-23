export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}

export interface NavigationConfig {
  rows: number;
  cols: number;
  wrapAround?: boolean;
  isTextarea?: boolean;
  isActive?: boolean;
  onClearCells?: (cells: CellPosition[]) => void;
  onSelectionChange?: (range: SelectionRange | null) => void;
  getMergeInfo?: (row: number, col: number) => {
    isMerged: boolean;
    isMainCell: boolean;
    mainRow: number;
    rowspan: number;
  };
  shouldSkipRow?: (row: number) => boolean;
}

export interface NavigationState {
  focusedCell: CellPosition | null;
  selectedRange: SelectionRange | null;
  isSelecting: boolean;
  dragStartCell: CellPosition | null;
  editingCell: CellPosition | null;
}

export type CellElement = HTMLInputElement | HTMLTextAreaElement;
export type CellRefArray = (CellElement | null)[][];
