import React from 'react';
import { Transaction, Category, User, ScannedReceiptData, TransactionType, AuthUser } from '../types';
import SummaryCards from './SummaryCards';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

interface DashboardProps {
  loggedInUser: AuthUser;
  currentUser: User;
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  addCategory: (name: string, type: TransactionType) => Promise<string>;
  deleteTransaction: (id: string) => Promise<void>;
  filteredTransactions: Transaction[];
  onScanReceiptClick: () => void;
  scannedData: ScannedReceiptData | null;
  clearScannedData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    loggedInUser, currentUser, transactions, categories, addTransaction, addCategory, deleteTransaction, filteredTransactions,
    onScanReceiptClick, scannedData, clearScannedData
}) => {
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <SummaryCards transactions={filteredTransactions} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <TransactionForm 
            loggedInUser={loggedInUser}
            currentUser={currentUser}
            categories={categories}
            addTransaction={addTransaction}
            addCategory={addCategory}
            onScanReceiptClick={onScanReceiptClick}
            initialData={scannedData}
            clearInitialData={clearScannedData}
          />
        </div>
        <div className="lg:col-span-3">
          <TransactionList
            transactions={recentTransactions}
            categories={categories}
            deleteTransaction={deleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
