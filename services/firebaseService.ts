import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { db } from '../firebaseConfig';
import { Transaction, Categories } from '../types';

interface AppData {
  transactions: Transaction[];
  categories: Categories;
  userNames: { fellipe: string; mhariana: string };
}

/**
 * Aguarda um tempo específico (helper para retry)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Busca dados de um usuário específico no Firestore
 * Implementa retry automático em caso de falhas temporárias
 * 
 * @param userId - ID do usuário autenticado
 * @param retries - Número de tentativas em caso de erro (padrão: 3)
 * @returns Dados do usuário ou null se não existir documento
 */
export const fetchData = async (
  userId: string, 
  retries: number = 3
): Promise<AppData | null> => {
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de buscar dados do Firestore...`);
      
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("✅ Dados carregados com sucesso do Firestore");
        return docSnap.data() as AppData;
      } else {
        console.log("📝 Nenhum documento encontrado. Novo usuário será criado.");
        return null; // Sem dados existentes, o app usará valores padrão
      }
      
    } catch (error: any) {
      console.error(`❌ Tentativa ${attempt} falhou:`, error);
      
      // Se for a última tentativa, lança o erro
      if (attempt === retries) {
        console.error("🚫 Todas as tentativas falharam.");
        throw new Error(
          `Não foi possível carregar os dados após ${retries} tentativas. ` +
          `Erro: ${error.message || 'Erro desconhecido'}`
        );
      }
      
      // Aguarda antes de tentar novamente (backoff exponencial)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`);
      await sleep(waitTime);
    }
  }
  
  return null;
};

/**
 * Salva dados de um usuário no Firestore
 * Usa merge para preservar campos não especificados
 * 
 * @param userId - ID do usuário autenticado
 * @param data - Dados a serem salvos
 */
export const saveData = async (
  userId: string, 
  data: AppData
): Promise<void> => {
  try {
    console.log("💾 Salvando dados no Firestore...");
    
    const docRef = doc(db, "users", userId);
    
    // Usa merge: true para não sobrescrever campos que não estão no objeto data
    await setDoc(docRef, data, { merge: true });
    
    console.log("✅ Dados salvos no Firestore com sucesso");
    
  } catch (error: any) {
    console.error("❌ Erro ao salvar documento:", error);
    
    // Lança erro mais descritivo
    throw new Error(
      `Falha ao sincronizar dados com a nuvem. ` +
      `Erro: ${error.message || 'Erro desconhecido'}`
    );
  }
};

/**
 * Função auxiliar para verificar se o Firestore está acessível
 * Útil para debug
 */
export const testFirestoreConnection = async (userId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", userId);
    await getDoc(docRef);
    console.log("✅ Conexão com Firestore OK");
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão com Firestore:", error);
    return false;
  }
};
