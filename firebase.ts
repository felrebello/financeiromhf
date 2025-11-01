import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkfI7B8U5to9y5hPgpFaC8rROa810hSdA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "financeiro-mhf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "financeiro-mhf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "financeiro-mhf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87885014221",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:87885014221:web:7abd974a691ef03c273584",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BWL0RB114M"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

// Inicializa o Auth
const auth = getAuth(app);

// Conecta aos emuladores se estiver em desenvolvimento (opcional)
// if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export { db, auth };