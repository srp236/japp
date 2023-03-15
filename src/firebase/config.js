// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqu-y7ardg0S6iemFfqtzXS0qb8Dujg0U",
  authDomain: "dandan-2cde4.firebaseapp.com",
  projectId: "dandan-2cde4",
  storageBucket: "dandan-2cde4.appspot.com",
  messagingSenderId: "417296682077",
  appId: "1:417296682077:web:d652ecb1f4fe2a42c751b4",
  measurementId: "G-9YZXV8NHK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
export const auth = getAuth(app);
// const analytics = getAnalytics(app);