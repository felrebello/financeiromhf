import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase
// NOTA: Em um aplicativo com um processo de compilação (como Vite ou Create React App),
// o ideal seria usar variáveis de ambiente para manter essas chaves seguras.
// Para este ambiente simplificado, as credenciais são inseridas diretamente aqui.
const firebaseConfig = {
  apiKey: "AIzaSyCkfI7B8U5to9y5hPgpFaC8rROa810hSdA",
  authDomain: "financeiro-mhf.firebaseapp.com",
  projectId: "financeiro-mhf",
  storageBucket: "financeiro-mhf.firebasestorage.app",
  messagingSenderId: "87885014221",
  appId: "1:87885014221:web:7abd974a691ef03c273584",
  measurementId: "G-BWL0RB114M"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };