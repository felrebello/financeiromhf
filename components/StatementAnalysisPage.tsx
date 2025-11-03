import React, { useState, useMemo } from 'react';
import { ParsedTransaction, Categories, User, ActiveView } from '../types';
import { TrashIcon, PlusIcon, CloseIcon } from './icons';

interface StatementAnalysisPageProps {
  initialTransactions: ParsedTransaction[];
  categories: Categories;
  userNames: { fellipe: string, mhariana: string };
  onConfirmImport: (transactions: Omit<ParsedTransaction, 'tempId'>[]) => void;
  setActiveView: (view: ActiveView) => void;
  addCategory: (name: string, type: 'income' | 'expense') => void;
}

const NewCategoryModal: React.FC<{ onSave: (name: string) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm relative animate-fade-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-slate-100 mb-4">Criar Nova Categoria</h3>
                <form onSubmit={handleSave}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nome da Categoria"
                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-700">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StatementAnalysisPage: React.FC<StatementAnalysisPageProps> = ({
  initialTransactions,
  categories,
  userNames,
  onConfirmImport,
  setActiveView,
  addCategory
}) => {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);

  const handleUpdate = (tempId: string, field: keyof ParsedTransaction, value: string | number) => {
    setTransactions(prev =>
      prev.map(t => (t.tempId === tempId ? { ...t, [field]: value } : t))
    );
  };
  
  const handleRemove = (tempId: string) => {
    setTransactions(prev => prev.filter(t => t.tempId !== tempId));
  };
  
  const totalAmount = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const handleImport = () => {
    if (transactions.length === 0) {
        alert("Não há lançamentos para importar.");
        return;
    }
    const transactionsToImport = transactions.map(({ tempId, ...rest }) => rest);
    onConfirmImport(transactionsToImport);
  };
  
  const handleOpenModal = (tempId: string) => {
    setActiveTransactionId(tempId);
    setIsModalOpen(true);
  };

  const handleSaveNewCategory = (newCategoryName: string) => {
    if (!categories.expense.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        addCategory(newCategoryName, 'expense');
    }
    if (activeTransactionId) {
        handleUpdate(activeTransactionId, 'category', newCategoryName);
    }
    setIsModalOpen(false);
    setActiveTransactionId(null);
  };

  return (
    <>
      {isModalOpen && <NewCategoryModal onSave={handleSaveNewCategory} onClose={() => setIsModalOpen(false)} />}
      <div className="animate-fade-in max-w-5xl mx-auto">
        <header className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-slate-100">Revise os Lançamentos da Fatura</h2>
          <p className="text-slate-400 mt-1">
            {transactions.length} lançamento(s) encontrado(s), totalizando{' '}
            <span className="font-bold text-slate-200">{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>.
          </p>
          <p className="text-xs text-slate-500 mt-1">Ajuste os detalhes abaixo antes de importar.</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.tempId} className="grid grid-cols-12 gap-2 sm:gap-4 items-center p-3 bg-slate-800/70 rounded-lg">
                {/* Description */}
                <input
                  type="text"
                  value={t.description}
                  onChange={e => handleUpdate(t.tempId, 'description', e.target.value)}
                  className="col-span-12 sm:col-span-3 bg-slate-700 border-slate-600 rounded-md p-2 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {/* Amount */}
                <input
                  type="number"
                  value={t.amount}
                  onChange={e => handleUpdate(t.tempId, 'amount', parseFloat(e.target.value) || 0)}
                  className="col-span-4 sm:col-span-2 bg-slate-700 border-slate-600 rounded-md p-2 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {/* Date */}
                <input
                  type="date"
                  value={t.date}
                  onChange={e => handleUpdate(t.tempId, 'date', e.target.value)}
                  className="col-span-8 sm:col-span-2 bg-slate-700 border-slate-600 rounded-md p-2 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {/* Category */}
                <div className="col-span-6 sm:col-span-2 flex items-center gap-2">
                    <select
                        value={t.category}
                        onChange={e => handleUpdate(t.tempId, 'category', e.target.value)}
                        className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {categories.expense.find(c => c.name === t.category) ? null : <option value={t.category}>{t.category} (sugerido)</option>}
                        {categories.expense.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button onClick={() => handleOpenModal(t.tempId)} className="p-2 flex-shrink-0 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors" title="Adicionar nova categoria">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* User */}
                <select
                  value={t.user}
                  onChange={e => handleUpdate(t.tempId, 'user', e.target.value)}
                  className="col-span-6 sm:col-span-2 bg-slate-700 border-slate-600 rounded-md p-2 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Fellipe">{userNames.fellipe}</option>
                  <option value="Mhariana">{userNames.mhariana}</option>
                </select>
                {/* Actions */}
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemove(t.tempId)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                    title="Remover lançamento"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-10">
                  <p className="text-slate-500">Nenhum lançamento para revisar.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={() => setActiveView('Dashboard')}
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-700"
            >
                Cancelar
            </button>
            <button 
              onClick={handleImport}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-opacity duration-200 disabled:opacity-50"
              disabled={transactions.length === 0}
            >
                Importar {transactions.length} Lançamento(s)
            </button>
        </div>
      </div>
    </>
  );
};

export default StatementAnalysisPage;
