// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Validação das variáveis de ambiente
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica se todas as variáveis estão definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, m => '_' + m).toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('❌ ERRO: Variáveis de ambiente do Firebase não configuradas!');
  console.error('Variáveis faltando:', missingVars.join(', '));
  console.error('\n📋 Crie um arquivo .env na raiz do projeto com:');
  console.error('VITE_FIREBASE_API_KEY=sua_api_key');
  console.error('VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain');
  console.error('VITE_FIREBASE_PROJECT_ID=seu_project_id');
  console.error('VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket');
  console.error('VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id');
  console.error('VITE_FIREBASE_APP_ID=seu_app_id');
  console.error('\n🔗 Obtenha suas credenciais em: https://console.firebase.google.com/');
  
  throw new Error(
    `Configuração do Firebase incompleta. Variáveis faltando: ${missingVars.join(', ')}`
  );
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId
};

console.log('✅ Firebase configurado com sucesso');
console.log('📦 Project ID:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);