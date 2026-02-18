import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyHp9X8hCzH8lFzk5YnGDSOkla3Yi2oEg",
  authDomain: "kamikarp-arcade.firebaseapp.com",
  projectId: "kamikarp-arcade",
  storageBucket: "kamikarp-arcade.firebasestorage.app",
  messagingSenderId: "56737110582",
  appId: "1:56737110582:web:e7b9878011775fda9dd697"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
