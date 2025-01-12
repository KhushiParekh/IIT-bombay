


import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUjPWdZ12vz-WuXN9i0BaCcbyo4FP9pbI",
  authDomain: "iit-b-cb598.firebaseapp.com",
  projectId: "iit-b-cb598",
  storageBucket: "iit-b-cb598.firebasestorage.app",
  messagingSenderId: "303703026948",
  appId: "1:303703026948:web:81ea08fd80c9f7ca307451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


export const auth=getAuth();

export const db = getFirestore(app);
export default app;