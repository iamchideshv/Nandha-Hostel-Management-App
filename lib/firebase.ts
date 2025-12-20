// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAr7R22If2_bEZYMmnVAkL-jAz8DEv_hsA",
    authDomain: "nandhablog-d4681.firebaseapp.com",
    projectId: "nandhablog-d4681",
    storageBucket: "nandhablog-d4681.firebasestorage.app",
    messagingSenderId: "570554601646",
    appId: "1:570554601646:web:586201fe923e240e515d3f",
    measurementId: "G-SP7LWFDS08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics conditionally (only supported in browser environments)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export const db = getFirestore(app);
export { app, analytics, auth };
