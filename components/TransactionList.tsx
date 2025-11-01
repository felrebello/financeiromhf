import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { TrashIcon, InformationCircleIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  deleteTransaction: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, deleteTransaction }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeZoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timeZoneOffset);
    return adjustedDate.toLocaleDateString('pt-BR');
  };

  return (
    <>
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Últimos Lançamentos</h2>
      <div className="space-y-4">
        {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum lançamento encontrado.</p>
        ) : (
            transactions.slice(0, 10).map(t => (
          <div key={t.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-md">
            <div className="flex items-center gap-4">
               <span className={`w-2 h-12 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <div>
                <p className="font-bold text-white">{t.description}</p>
                <p className="text-sm text-gray-400">{getCategoryName(t.categoryId)} - {t.userName}</p>
                 {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {t.tags.map(tag => (
                            <span key={tag} className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-sm text-gray-400">{formatDate(t.date)}</p>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setSelectedTransaction(t)} className="text-gray-500 hover:text-blue-400 transition-colors" title="Ver detalhes">
                    <InformationCircleIcon className="w-5 h-5" />
                </button>
                 <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Excluir">
                      <TrashIcon />
                 </button>
            </div>
          </div>
        )))}
      </div>
    </div>
     {selectedTransaction && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTransaction(null)}>
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Detalhes do Lançamento</h3>
          <dl className="text-gray-300 space-y-3">
            <div className="grid grid-cols-3 gap-4">
                <dt className="font-semibold text-gray-400">Descrição:</dt>
                <dd className="col-span-2 text-white">{selectedTransaction.description}</dd>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <dt className="font-semibold text-gray-400">Valor:</dt>
                <dd className={`col-span-2 font-bold ${selectedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{selectedTransaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <dt className="font-semibold text-gray-400">Tipo:</dt>
                <dd className="col-span-2">{selectedTransaction.type === 'income' ? 'Receita' : 'Despesa'}</dd>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <dt className="font-semibold text-gray-400">Categoria:</dt>
                <dd className="col-span-2">{getCategoryName(selectedTransaction.categoryId)}</dd>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <dt className="font-semibold text-gray-400">Data Lançamento:</dt>
                <dd className="col-span-2">{formatDate(selectedTransaction.date)}</dd>
            </div>
            {selectedTransaction.tags.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <dt className="font-semibold text-gray-400">Tags:</dt>
                    <dd className="col-span-2">{selectedTransaction.tags.join(', ')}</dd>
                </div>
            )}
            <div className="pt-3 mt-3 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4">
                    <dt className="font-semibold text-gray-400">Lançado por:</dt>
                    <dd className="col-span-2">{selectedTransaction.userName}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                    <dt className="font-semibold text-gray-400">Lançado em:</dt>
                    <dd className="col-span-2 text-sm">{selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString('pt-BR') : 'N/A'}</dd>
                </div>
            </div>
          </dl>
          <button onClick={() => setSelectedTransaction(null)} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Fechar
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default TransactionList;
