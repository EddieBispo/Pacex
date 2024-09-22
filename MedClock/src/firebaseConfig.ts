// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCE13L9CktUuNipR9CdbdEomDVZurvOvAk",
    authDomain: "medclock-6c5f2.firebaseapp.com",
    databaseURL: "https://medclock-6c5f2-default-rtdb.firebaseio.com",
    projectId: "medclock-6c5f2",
    storageBucket: "medclock-6c5f2.appspot.com",
    messagingSenderId: "30101627232",
    appId: "1:30101627232:web:e87b0ddb56fa9e1cf93e05",
    measurementId: "G-R6YVVHN5E0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
