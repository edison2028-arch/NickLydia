export interface Guest {
  id: string;
  name: string;
  isPlusOne: boolean;
  isCheckedIn: boolean; // Added check-in status
  parentId?: string; // ID of the guest who added them, used for moving together
}

export interface Table {
  id: string; // Table Number or 'Main'
  category: string; // e.g., '男方家人', '素食桌'
  guests: Guest[];
  note?: string; // e.g., '兒童椅'
}

export type ViewState = 'SEARCH' | 'MAP';

export interface SearchResult {
  tableId: string;
  guestId: string;
  guestName: string;
  category: string;
  isCheckedIn: boolean;
  isPlusOne: boolean;
}