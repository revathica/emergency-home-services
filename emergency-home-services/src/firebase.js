/*/ Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkBwtc3CeI55AoB65RVVerJkkTgRSKoU0",
  authDomain: "emergency-home-services-dde63.firebaseapp.com",
  projectId: "emergency-home-services-dde63",
  storageBucket: "emergency-home-services-dde63.firebasestorage.app",
  messagingSenderId: "1089896056922",
  appId: "1:1089896056922:web:5a7068ae16ac762e58f063",
  measurementId: "G-Z0NNJQ2QRX"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkBwtc3CeI55AoB65RVVerJkkTgRSKOUE",
  authDomain: "emergency-home-services-dde63.firebaseapp.com",
  projectId: "emergency-home-services-dde63",
  storageBucket: "emergency-home-services-dde63.firebasestorage.app",
  messagingSenderId: "1089896056922",
  appId: "1:1089896056922:web:5a7068ae16ac762e58f063",
  measurementId: "G-Z0NNJQ2QRX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore Database Instance
export const db = getFirestore(app);