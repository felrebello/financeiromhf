import React from 'react';
import { Transaction, TransactionType, User } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, TrashIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  userNames: { fellipe: string, mhariana: string };
  onRemoveTransaction: (id: string) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction; userNames: { fellipe: string, mhariana: string }; onRemove: (id: string) => void; onSelect: (transaction: Transaction) => void; }> = ({ transaction, userNames, onRemove, onSelect }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const Icon = isIncome ? ArrowUpCircleIcon : ArrowDownCircleIcon;
  const displayName = transaction.user === 'Fellipe' ? userNames.fellipe : userNames.mhariana;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <li 
      className="flex items-center justify-between p-4 bg-slate-800/70 rounded-lg space-x-4 cursor-pointer transition-colors duration-200 hover:bg-slate-800"
      onClick={() => onSelect(transaction)}
    >
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Icon className={`h-8 w-8 flex-shrink-0 ${isIncome ? 'text-green-500' : 'text-red-500'}`} />
        <div className="min-w-0">
          <p className="text-slate-200 font-semibold truncate">{transaction.description} <span className="text-xs text-slate-500">({displayName})</span></p>
          <p className="text-sm text-slate-400">{transaction.category} - {formatDate(transaction.date)}</p>
          {transaction.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {transaction.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
          <p className={`text-lg font-bold ${amountColor}`}>
              {isIncome ? '+' : '-'} {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(transaction.id);
            }} 
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
      </div>
    </li>
  );
};


const TransactionList: React.FC<TransactionListProps> = ({ transactions, userNames, onRemoveTransaction, onSelectTransaction }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Últimos Lançamentos</h2>
      {transactions.length > 0 ? (
        <ul className="space-y-3 h-[calc(100%-36px)] overflow-y-auto pr-2">
          {transactions.map(t => (
            <TransactionItem key={t.id} transaction={t} userNames={userNames} onRemove={onRemoveTransaction} onSelect={onSelectTransaction} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 flex items-center justify-center h-[calc(100%-36px)]">
            <p className="text-slate-500">Nenhum lançamento encontrado.</p>
        </div>
      )}
    </section>
  );
};

export default TransactionList;