
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfqpsCxS2dkmQUaKDHAd7EWS6-ixCL4EE",
  authDomain: "chefs-bd.firebaseapp.com",
  projectId: "chefs-bd",
  storageBucket: "chefs-bd.appspot.com",
  messagingSenderId: "715801468404",
  appId: "1:715801468404:web:cd31745ac650c715db2da1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
