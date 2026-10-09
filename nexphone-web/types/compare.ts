export interface CompareContextType {
  selectedIds: string[];
  addPhone: (id: string) => boolean;
  removePhone: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  totalCompare: number;
}
