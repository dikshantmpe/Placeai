import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU6aZfc8rOn3KpH2S7paY-mOliqfgnSUI",
  authDomain: "placeprep-ai-3d938.firebaseapp.com",
  projectId: "placeprep-ai-3d938",
  storageBucket: "placeprep-ai-3d938.firebasestorage.app",
  messagingSenderId: "524668166808",
  appId: "1:524668166808:web:710485f74e127d066466ed",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();