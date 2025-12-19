import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  DocumentReference,
  deleteDoc,
} from 'firebase/firestore';
import { Book } from './types';

const BOOKS_COLLECTION = 'books';

export const addBook = async (book: Omit<Book, 'id'>) => {
  const docRef = await addDoc(collection(db, BOOKS_COLLECTION), book);
  return docRef.id;
};

export const getBooksByUser = async (userId: string): Promise<Book[]> => {
  const q = query(collection(db, BOOKS_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
};

export const listenToBooksByUser = (userId: string, cb: (books: Book[]) => void) => {
  const q = query(collection(db, BOOKS_COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, snapshot => {
    cb(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
  });
};

export const updateBookProgress = async (bookId: string, pagesRead: number, status?: Book['status']) => {
  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  const update: any = { pagesRead };
  if (status) update.status = status;
  await updateDoc(bookRef, update);
};


export const updateBookRating = async (bookId: string, rating: number, journal?: string) => {
  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  const update: any = { rating };
  if (journal !== undefined) update.journal = journal;
  await updateDoc(bookRef, update);
};

export const updateBookJournal = async (bookId: string, journal: string) => {
  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  await updateDoc(bookRef, { journal });
};

export const deleteBook = async (bookId: string) => {
  await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
};
