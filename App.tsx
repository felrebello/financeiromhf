import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Transaction, TransactionType, User, ViewUser, ActiveView, Categories, ParsedTransaction } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FilterBar from './components/FilterBar';
import ReportsPage from './components/Reports';
import CategoryManager from './components/Categories';
import ProfilePage from './components/Profile';
import TransactionDetailModal from './components/TransactionDetailModal';
import LoginPage from './components/LoginPage';
import StatementAnalysisPage from './components/StatementAnalysisPage';
import { analyzeReceipt, analyzeStatement } from './services/geminiService';
import { fetchData, saveData } from './services/firebaseService';
import { DashboardIcon, ReportsIcon, CategoryIcon, ProfileIcon, LoaderIcon } from './components/icons';

const defaultCategories: Categories = {
  expense: [
    { id: 'e1', name: 'Alimentação' },
    { id: 'e2', name: 'Moradia' },
    { id: 'e3', name: 'Transporte' },
    { id: 'e4', name: 'Lazer' },
    { id: 'e5', name: 'Saúde' },
    { id: 'e6', name: 'Outros' },
  ],
  income: [
    { id: 'i1', name: 'Salário' },
    { id: 'i2', name: 'Freelance' },
    { id: 'i3', name: 'Investimentos' },
    { id: 'i4', name: 'Outros' },
  ],
};

const initialTransactions: Transaction[] = [];

// Mobile Navigation Component
const MobileNavButton: React.FC<{
  icon: React.ReactNode;
  label: ActiveView;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      active ? 'text-blue-400' : 'text-slate-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-xs font-medium mt-1">{label}</span>
  </button>
);

const MobileNav: React.FC<{
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 md:hidden z-40">
      <div className="flex justify-around">
        <MobileNavButton
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          active={activeView === 'Dashboard'}
          onClick={() => setActiveView('Dashboard')}
        />
        <MobileNavButton
          icon={<ReportsIcon className="w-6 h-6" />}
          label="Relatórios"
          active={activeView === 'Relatórios'}
          onClick={() => setActiveView('Relatórios')}
        />
        <MobileNavButton
          icon={<CategoryIcon className="w-6 h-6" />}
          label="Categorias"
          active={activeView === 'Categorias'}
          onClick={() => setActiveView('Categorias')}
        />
        <MobileNavButton
          icon={<ProfileIcon className="w-6 h-6" />}
          label="Perfil"
          active={activeView === 'Perfil'}
          onClick={() => setActiveView('Perfil')}
        />
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User>('Fellipe');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [categories, setCategories] = useState<Categories>(defaultCategories);
  const [userNames, setUserNames] = useState({ fellipe: 'Fellipe', mhariana: 'Mhariana' });
  
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<ViewUser>('Ambos');
  const [activeView, setActiveView] = useState<ActiveView>('Dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialLoadDone = useRef(false);

  // Auto-dismiss error and success messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setAuthUser(user);
      setIsAuthLoading(false);
      if (!user) {
        // Reset state on logout
        isInitialLoadDone.current = false;
        setTransactions([]);
        setCategories(defaultCategories);
        setUserNames({ fellipe: 'Fellipe', mhariana: 'Mhariana' });
        console.log('👋 User logged out, state reset');
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced save function to Firestore
  const debouncedSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      if (authUser && isInitialLoadDone.current) {
        console.log('💾 Salvando dados no Firestore...');
        const fullData = { transactions, categories, userNames };
        saveData(authUser.uid, fullData)
          .then(() => {
            console.log('✅ Dados salvos com sucesso!');
            setSuccessMessage('Dados sincronizados');
          })
          .catch(err => {
            console.error("❌ Falha ao salvar dados:", err);
            setError("Falha ao sincronizar. Tente novamente.");
          });
      }
    }, 1000);
  }, [transactions, categories, userNames, authUser]);

  // Load data from cloud when user logs in
  useEffect(() => {
    if (authUser && !isInitialLoadDone.current) {
      console.log('📥 Carregando dados do Firestore para:', authUser.email);
      setIsCloudLoading(true);
      setError(null);
      
      fetchData(authUser.uid)
        .then(data => {
          if (data) {
            console.log('✅ Dados carregados do Firestore:', {
              transactions: data.transactions?.length || 0,
              categories: Object.keys(data.categories || {}).length,
            });
            setTransactions(data.transactions || []);
            setCategories(data.categories || defaultCategories);
            setUserNames(data.userNames || { fellipe: 'Fellipe', mhariana: 'Mhariana' });
            setSuccessMessage('Dados carregados com sucesso');
          } else {
            console.log('📄 Nenhum dado encontrado. Usando valores padrão.');
            setTransactions(initialTransactions);
            setCategories(defaultCategories);
          }
        })
        .catch(err => {
          console.error("❌ Erro ao carregar dados:", err);
          
          // Mensagem de erro mais específica
          let errorMessage = "Não foi possível carregar os dados.";
          
          if (err.message?.includes('permission-denied')) {
            errorMessage = "Acesso negado. Verifique as regras do Firestore.";
          } else if (err.message?.includes('network')) {
            errorMessage = "Erro de rede. Verifique sua conexão.";
          }
          
          setError(errorMessage);
          setTransactions(initialTransactions);
          setCategories(defaultCategories);
        })
        .finally(() => {
          setIsCloudLoading(false);
          isInitialLoadDone.current = true;
          // Set internal user based on email after loading data
          if (authUser.email) {
            const user = authUser.email.toLowerCase().startsWith('fel') ? 'Fellipe' : 'Mhariana';
            setCurrentUser(user);
            console.log('👤 Usuário interno definido como:', user);
          }
        });
    }
  }, [authUser]);

  // Save data to cloud on any change
  useEffect(() => {
    if (isInitialLoadDone.current) {
        debouncedSave();
    }
  }, [transactions, categories, userNames, debouncedSave]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    console.log('👋 Fazendo logout...');
    signOut(auth)
      .then(() => console.log('✅ Logout bem-sucedido'))
      .catch(error => console.error("❌ Erro ao fazer logout:", error));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>, date?: string) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().getTime().toString() + Math.random(),
      date: date || new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('➕ Nova transação adicionada:', newTransaction);
  };
  
  const handleConfirmImport = (transactionsToImport: Omit<ParsedTransaction, 'tempId'>[]) => {
      const newTransactions: Transaction[] = transactionsToImport.map(t => ({
          ...t,
          id: new Date().getTime().toString() + Math.random(),
          date: new Date(t.date).toISOString()
      }));
      setTransactions(prev => [...newTransactions, ...prev]);
      setActiveView('Dashboard');
      setParsedTransactions([]);
      setSuccessMessage(`${newTransactions.length} transações importadas`);
      console.log('📥 Transações importadas:', newTransactions.length);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    console.log('🗑️ Transação removida:', id);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
    console.log('✏️ Transação atualizada:', updatedTransaction.id);
  };

  const addCategory = (name: string, type: 'income' | 'expense') => {
    if (name && !categories[type].find(c => c.name.toLowerCase() === name.toLowerCase())) {
        const newCategory = { id: new Date().getTime().toString(), name };
        setCategories(prev => ({...prev, [type]: [...prev[type], newCategory]}));
        console.log('➕ Nova categoria adicionada:', newCategory);
    }
  };
  
  const updateCategory = (id: string, newName: string, type: 'income' | 'expense') => {
    setCategories(prev => ({
        ...prev,
        [type]: prev[type].map(c => c.id === id ? { ...c, name: newName } : c)
    }));
    console.log('✏️ Categoria atualizada:', id, '→', newName);
  };

  const deleteCategory = (id: string, type: 'income' | 'expense') => {
    setCategories(prev => ({
        ...prev,
        [type]: prev[type].filter(c => c.id !== id)
    }));
    console.log('🗑️ Categoria removida:', id);
  };
  
  const updateUserNames = (newNames: { fellipe: string, mhariana: string }) => {
    setUserNames(newNames);
    console.log('👤 Nomes de usuário atualizados:', newNames);
  };

  const handleReceiptAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    console.log('🔍 Analisando nota fiscal:', file.name);
    try {
      const result = await analyzeReceipt(file, categories.expense.map(c => c.name));
      if (result) {
        addTransaction({
          user: currentUser,
          type: TransactionType.EXPENSE,
          amount: result.amount,
          category: result.category,
          description: result.description,
          tags: result.tags,
        });
        if (!categories.expense.find(c => c.name.toLowerCase() === result.category.toLowerCase())) {
            addCategory(result.category, 'expense');
        }
        setSuccessMessage('Nota fiscal analisada com sucesso');
        console.log('✅ Nota fiscal analisada:', result);
      }
    } catch (err) {
      console.error('❌ Erro ao analisar nota fiscal:', err);
      setError(err instanceof Error ? err.message : 'Erro ao analisar a nota.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatementAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    console.log('🔍 Analisando fatura:', file.name);
    try {
        const results = await analyzeStatement(file, categories.expense.map(c => c.name), currentUser);
        const parsed: ParsedTransaction[] = results.map((r, index) => ({
            ...r,
            tempId: Date.now().toString() + index,
            user: currentUser,
        }));
        setParsedTransactions(parsed);
        setActiveView('Análise');
        setSuccessMessage(`${parsed.length} transações encontradas`);
        console.log('✅ Fatura analisada:', parsed.length, 'transações');
    } catch (err) {
        console.error('❌ Erro ao analisar fatura:', err);
        setError(err instanceof Error ? err.message : 'Erro ao analisar a fatura.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectTransaction = (transaction: Transaction) => setSelectedTransaction(transaction);
  const handleCloseModal = () => setSelectedTransaction(null);

  const filteredTransactions = useMemo(() => {
    if (viewUser === 'Ambos') return transactions;
    return transactions.filter(t => t.user === viewUser);
  }, [transactions, viewUser]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <LoaderIcon className="w-12 h-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg">Verificando autenticação...</p>
      </div>
    );
  }

  // Not authenticated
  if (!authUser) {
    return <LoginPage />;
  }
  
  // Loading cloud data
  if (isCloudLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <LoaderIcon className="w-12 h-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg">Sincronizando seus dados...</p>
      </div>
    );
  }
  
  const renderActiveView = () => {
    switch(activeView) {
      case 'Dashboard':
        return (
          <>
            <FilterBar viewUser={viewUser} setViewUser={setViewUser} userNames={userNames} />
            <main className="mt-6">
              <Dashboard transactions={filteredTransactions} />
              
              {/* Error Alert */}
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative text-center my-6 animate-fade-in" role="alert">
                  <strong className="font-bold">Erro: </strong>
                  <span className="block sm:inline">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="absolute top-0 right-0 px-4 py-3"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg relative text-center my-6 animate-fade-in" role="alert">
                  <span className="block sm:inline">✓ {successMessage}</span>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <TransactionForm 
                    currentUser={currentUser}
                    userNames={userNames}
                    onAddTransaction={addTransaction}
                    onAnalyzeReceipt={handleReceiptAnalysis}
                    onAnalyzeStatement={handleStatementAnalysis}
                    isLoading={isLoading} 
                    categories={categories}
                    setActiveView={setActiveView}
                  />
                </div>
                <div className="lg:col-span-3">
                  <TransactionList 
                    transactions={filteredTransactions} 
                    userNames={userNames}
                    onRemoveTransaction={removeTransaction}
                    onSelectTransaction={handleSelectTransaction}
                  />
                </div>
              </div>
            </main>
          </>
        );
      case 'Relatórios':
        return <main className="mt-8"><ReportsPage transactions={transactions} /></main>;
      case 'Categorias':
        return (
            <main className="mt-8">
              <CategoryManager 
                categories={categories}
                addCategory={addCategory}
                updateCategory={updateCategory}
                deleteCategory={deleteCategory}
              />
            </main>
        );
      case 'Perfil':
        return <main className="mt-8"><ProfilePage userNames={userNames} onSave={updateUserNames} firebaseUser={authUser} /></main>;
      case 'Análise':
        return (
            <main className="mt-8">
                <StatementAnalysisPage
                    initialTransactions={parsedTransactions}
                    categories={categories}
                    userNames={userNames}
                    onConfirmImport={handleConfirmImport}
                    setActiveView={setActiveView}
                    addCategory={addCategory}
                />
            </main>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pb-20 md:pb-0">
        <Header 
            userNames={userNames}
            currentUserEmail={authUser.email || 'Usuário'}
            activeView={activeView}
            setActiveView={setActiveView} 
            onLogout={handleLogout}
        />
        {renderActiveView()}
      </div>

      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction}
          userNames={userNames}
          onClose={handleCloseModal}
          onUpdateTransaction={updateTransaction}
          categories={categories}
        />
      )}

      <MobileNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
