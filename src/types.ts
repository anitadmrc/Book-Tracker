export type BookStatus = 'currentlyReading' | 'wantToRead' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  totalPages: number;
  pagesRead: number;
  status: BookStatus;
  rating?: number;
  userId: string;
  journal?: string; // User's journal entry/opinion
}
