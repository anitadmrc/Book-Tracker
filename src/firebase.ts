// Firebase configuration and initialization for Book Reading Tracker
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: 'AIzaSyDcdAObRdoP3-_52mzS2jmNCxDZDxe7TFc',
  authDomain: 'book-review-6e3ae.firebaseapp.com',
  projectId: 'book-review-6e3ae',
  storageBucket: 'book-review-6e3ae.appspot.com',
  messagingSenderId: '1077372672320',
  appId: '1:1077372672320:web:2e46d8032aaee3f01382a5',
  measurementId: 'G-LX2DRZXR1J'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const signInAnon = () => signInAnonymously(auth);
export const db = getFirestore(app);
