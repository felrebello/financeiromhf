import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

import { Transaction, Category, User, View, TransactionType, ScannedReceiptData, AuthUser } from './types';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import CategoryManager from './components/CategoryManager';
import { HomeIcon, ChartBarIcon, TagIcon } from './components/icons';
import Login from './components/Login';
import ScanReceipt from './components/ScanReceipt';

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<User>('Eu');
  const [view, setView] = useState<View>('dashboard');
  const [viewUserFilter, setViewUserFilter] = useState<User | 'Ambos'>('Ambos');
  const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) {
      setTransactions([]);
      setCategories([]);
      setDataLoading(true);
      return;
    };

    setDataLoading(true);

    // Aguarda o token de autenticação estar pronto antes de configurar os listeners do Firestore
    const setupFirestoreListeners = async () => {
      try {
        // Garante que o token de autenticação está disponível
        await authUser.getIdToken();

        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        const unsubscribeTransactions = onSnapshot(q, (querySnapshot) => {
          const transactionsData: Transaction[] = [];
          querySnapshot.forEach((doc) => {
            transactionsData.push({ ...doc.data(), id: doc.id } as Transaction);
          });
          setTransactions(transactionsData);
          setDataLoading(false);
        }, (error) => {
            console.error("Error fetching transactions: ", error);
            setDataLoading(false);
        });

        const qCategories = query(collection(db, 'categories'), orderBy('name', 'asc'));
        const unsubscribeCategories = onSnapshot(qCategories, (querySnapshot) => {
          const categoriesData: Category[] = [];
          querySnapshot.forEach((doc) => {
            categoriesData.push({ ...doc.data(), id: doc.id } as Category);
          });
          setCategories(categoriesData);
        }, (error) => {
            console.error("Error fetching categories: ", error);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeCategories();
        };
      } catch (error) {
        console.error("Error setting up Firestore listeners: ", error);
        setDataLoading(false);
      }
    };

    let cleanup: (() => void) | undefined;
    setupFirestoreListeners().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [authUser]);


  const filteredTransactions = useMemo(() => {
    if (viewUserFilter === 'Ambos') {
      return transactions;
    }
    return transactions.filter(t => t.userName === viewUserFilter);
  }, [transactions, viewUserFilter]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
        const transactionWithTimestamp = {
            ...transaction,
            createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "transactions"), transactionWithTimestamp);
    } catch(e) {
        console.error("Error adding transaction: ", e);
        alert("Ocorreu um erro ao adicionar o lançamento.");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
        await deleteDoc(doc(db, "transactions", id));
    } catch(e) {
        console.error("Error deleting transaction: ", e);
        alert("Ocorreu um erro ao deletar o lançamento.");
    }
  };
  
  const addCategoryWithId = async (name: string, type: TransactionType): Promise<string> => {
    const newCategory: Omit<Category, 'id'> = { name, type };
    try {
        const docRef = await addDoc(collection(db, "categories"), newCategory);
        return docRef.id;
    } catch(e) {
        console.error("Error adding category: ", e);
        alert("Ocorreu um erro ao adicionar a categoria.");
        throw e;
    }
  };

  const addCategory = async (name: string, type: TransactionType): Promise<void> => {
    await addCategoryWithId(name, type);
  };
  
  const deleteCategory = async (id: string) => {
      if (!confirm('Tem certeza que deseja excluir esta categoria? Todas as transações associadas a ela ficarão sem categoria.')) return;
      try {
        await deleteDoc(doc(db, "categories", id));
      } catch(e) {
        console.error("Error deleting category: ", e);
        alert("Ocorreu um erro ao deletar a categoria.");
      }
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Error signing out:", error));
  };

  const onScanReceiptClick = () => {
    setView('scanReceipt');
  };

  const clearScannedData = () => {
    setScannedData(null);
  };

  const handleScanComplete = (data: ScannedReceiptData) => {
    setScannedData(data);
    setView('dashboard');
  };

  const handleScanCancel = () => {
    setView('dashboard');
  };


  if (authLoading) {
    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
            <div className="text-white text-xl animate-pulse">Verificando autenticação...</div>
        </div>
    )
  }

  if (!authUser) {
    return <Login />;
  }

  if (dataLoading) {
    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">
            <div className="text-white text-xl animate-pulse">Carregando dados...</div>
        </div>
    )
  }

  const renderView = () => {
    if (!authUser) return null;

    const loggedInUser: AuthUser = {
      uid: authUser.uid,
      email: authUser.email || '',
      name: currentUser
    };

    switch (view) {
      case 'dashboard':
        return <Dashboard
                  loggedInUser={loggedInUser}
                  currentUser={currentUser}
                  transactions={transactions}
                  categories={categories}
                  addTransaction={addTransaction}
                  addCategory={addCategoryWithId}
                  deleteTransaction={deleteTransaction}
                  filteredTransactions={filteredTransactions}
                  onScanReceiptClick={onScanReceiptClick}
                  scannedData={scannedData}
                  clearScannedData={clearScannedData}
                />;
      case 'reports':
        return <Reports transactions={filteredTransactions} categories={categories} />;
      case 'categories':
        return <CategoryManager categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />;
      case 'scanReceipt':
        return <ScanReceipt onScanComplete={handleScanComplete} onCancel={handleScanCancel} />;
      default:
        return <Dashboard
                  loggedInUser={loggedInUser}
                  currentUser={currentUser}
                  transactions={transactions}
                  categories={categories}
                  addTransaction={addTransaction}
                  addCategory={addCategoryWithId}
                  deleteTransaction={deleteTransaction}
                  filteredTransactions={filteredTransactions}
                  onScanReceiptClick={onScanReceiptClick}
                  scannedData={scannedData}
                  clearScannedData={clearScannedData}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 shadow-md p-4 flex flex-wrap justify-between items-center sticky top-0 z-10 gap-4">
        <h1 className="text-2xl font-bold text-white">Finanças do Casal</h1>
        <nav className="flex items-center gap-2 sm:gap-4 order-last sm:order-none w-full sm:w-auto justify-center">
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 p-2 rounded-md ${view === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><HomeIcon className="w-5 h-5"/>Dashboard</button>
          <button onClick={() => setView('reports')} className={`flex items-center gap-2 p-2 rounded-md ${view === 'reports' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><ChartBarIcon className="w-5 h-5"/>Relatórios</button>
          <button onClick={() => setView('categories')} className={`flex items-center gap-2 p-2 rounded-md ${view === 'categories' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><TagIcon className="w-5 h-5"/>Categorias</button>
        </nav>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 hidden sm:inline">Lançar:</span>
                <div className="flex rounded-md bg-gray-700 p-1">
                    <button onClick={() => setCurrentUser('Eu')} className={`px-3 py-1 text-sm rounded ${currentUser === 'Eu' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>Eu</button>
                    <button onClick={() => setCurrentUser('Esposa')} className={`px-3 py-1 text-sm rounded ${currentUser === 'Esposa' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>Esposa</button>
                </div>
            </div>
            <button onClick={handleLogout} className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition duration-300">Sair</button>
        </div>
      </header>
      
      <main className="p-4 sm:p-8">
        {view !== 'categories' && (
          <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-400">Visualizando:</span>
              <div className="flex rounded-md bg-gray-800 p-1">
                  <button onClick={() => setViewUserFilter('Ambos')} className={`px-3 py-1 text-sm rounded ${viewUserFilter === 'Ambos' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>Ambos</button>
                  <button onClick={() => setViewUserFilter('Eu')} className={`px-3 py-1 text-sm rounded ${viewUserFilter === 'Eu' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>Eu</button>
                  <button onClick={() => setViewUserFilter('Esposa')} className={`px-3 py-1 text-sm rounded ${viewUserFilter === 'Esposa' ? 'bg-indigo-600 text-white' : 'text-gray-300'}`}>Esposa</button>
              </div>
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
};

export default App;