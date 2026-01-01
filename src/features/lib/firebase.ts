// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDan08oxqjXdQ4T7HxcAuw7LYDR6yRPoG8",
  authDomain: "folio-firebase-app.firebaseapp.com",
  projectId: "folio-firebase-app",
  storageBucket: "folio-firebase-app.firebasestorage.app",
  messagingSenderId: "893766372993",
  appId: "1:893766372993:web:8d746952d0b8acbd648780",
  measurementId: "G-BNV8WXKG9F"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
