// Importiere Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Deine Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyDpm3JcksoNvMoSNHRX2h07G9gOG-geL1Y",
    authDomain: "prototypconnectnow.firebaseapp.com",
    projectId: "prototypconnectnow",
    storageBucket: "prototypconnectnow.firebasestorage.app",
    messagingSenderId: "956264456718",
    appId: "1:956264456718:web:a95e2285a4efe52292925f",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Zugriff auf Firestore
const db = getFirestore(app);

export default db;
