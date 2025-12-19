import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Book } from './types';

const BOOKS_COLLECTION = 'books';

export const getBookById = async (bookId: string): Promise<Book | null> => {
  const docRef = doc(db, BOOKS_COLLECTION, bookId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Book;
};
