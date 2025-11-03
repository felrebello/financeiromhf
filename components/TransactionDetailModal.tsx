import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Categories, User } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, CloseIcon, PencilIcon } from './icons';

interface TransactionDetailModalProps {
  transaction: Transaction;
  userNames: { fellipe: string, mhariana: string };
  onClose: () => void;
  onUpdateTransaction: (updatedTransaction: Transaction) => void;
  categories: Categories;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, userNames, onClose, onUpdateTransaction, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Transaction>(transaction);

  useEffect(() => {
    setFormData(transaction);
    setIsEditing(false); // Reset edit mode when transaction prop changes
  }, [transaction]);

  const isIncome = formData.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const Icon = isIncome ? ArrowUpCircleIcon : ArrowDownCircleIcon;
  const displayName = formData.user === 'Fellipe' ? userNames.fellipe : userNames.mhariana;

  const formattedDateTime = new Date(formData.date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // "YYYY-MM-DD"
    const originalDate = new Date(formData.date);
    const timePart = originalDate.toISOString().split('T')[1];
    const newIsoDate = `${newDate}T${timePart}`;
    setFormData({ ...formData, date: newIsoDate });
};

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }));
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTransaction(formData);
    onClose();
  };
  
  const currentCategories = formData.type === TransactionType.INCOME ? categories.income : categories.expense;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-detail-title"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in shadow-2xl shadow-slate-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Fechar"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        {isEditing ? (
          <form onSubmit={handleSave}>
             <h2 id="transaction-detail-title" className="text-2xl font-bold text-slate-100 mb-6">Editar Lançamento</h2>
             <div className="space-y-4">
                 <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Descrição" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 <div className="grid grid-cols-5 gap-4">
                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Valor (R$)" className="col-span-3 bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="date" name="date" value={formData.date.split('T')[0]} onChange={handleDateChange} className="col-span-2 bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {currentCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select name="user" value={formData.user} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Fellipe">{userNames.fellipe}</option>
                        <option value="Mhariana">{userNames.mhariana}</option>
                    </select>
                 </div>
                 <input type="text" value={formData.tags.join(', ')} onChange={handleTagsChange} placeholder="Tags (separadas por vírgula)" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
             </div>
             <div className="mt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-700">
                    Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                    Salvar
                </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start space-x-4">
              <Icon className={`h-10 w-10 flex-shrink-0 mt-1 ${isIncome ? 'text-green-500' : 'text-red-500'}`} />
              <div className='flex-1'>
                <h2 id="transaction-detail-title" className="text-2xl font-bold text-slate-100 pr-8">{formData.description}</h2>
                <p className={`text-xl font-semibold ${amountColor}`}>
                  {isIncome ? '+' : '-'} {formData.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-700/50 pt-6 space-y-3 text-slate-300">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Cadastrado por:</span>
                <span className="font-medium text-slate-200">{displayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Data e Hora:</span>
                <span className="font-medium text-slate-200">{formattedDateTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Categoria:</span>
                <span className="font-medium bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm">{formData.category}</span>
              </div>
              {formData.tags.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-400 mb-2 block">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="text-sm bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 border-t border-slate-700/50 pt-4 flex justify-end">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailModal;