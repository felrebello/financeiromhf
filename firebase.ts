import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
const db = getFirestore(app);
const auth = getAuth(app);

// Descomente para usar o emulador local do Firestore durante desenvolvimento
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { db, auth };