import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, User, Categories, ActiveView } from '../types';
import { CameraIcon, PlusCircleIcon, LoaderIcon, CreditCardIcon } from './icons';

interface TransactionFormProps {
  currentUser: User;
  userNames: { fellipe: string, mhariana: string };
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onAnalyzeReceipt: (file: File) => Promise<void>;
  onAnalyzeStatement: (file: File) => Promise<void>;
  isLoading: boolean;
  categories: Categories;
  setActiveView: (view: ActiveView) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ currentUser, userNames, onAddTransaction, onAnalyzeReceipt, onAnalyzeStatement, isLoading, categories, setActiveView }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const statementInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      alert('Por favor, preencha valor, descrição e categoria.');
      return;
    }
    onAddTransaction({
      user: currentUser,
      type,
      description,
      amount: parseFloat(amount),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setTags('');
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onAnalyzeReceipt(selectedFile);
      if(receiptInputRef.current) receiptInputRef.current.value = "";
    }
  };

  const handleStatementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onAnalyzeStatement(selectedFile);
      if(statementInputRef.current) statementInputRef.current.value = "";
    }
  };
  
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(''); // Reset category when type changes
  };

  const currentCategories = type === TransactionType.INCOME ? categories.income : categories.expense;
  
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Novo Lançamento</h2>
      
      <form onSubmit={handleManualSubmit} className="space-y-4 flex flex-col h-[calc(100%-36px)]">
        <div className='flex gap-2'>
            <button 
              type="button" 
              disabled={isLoading}
              onClick={() => receiptInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-teal-500/20 border border-teal-500 text-teal-400 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-teal-500/30 disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? ( <LoaderIcon className="animate-spin h-5 w-5" /> ) : ( <CameraIcon className="h-5 w-5" /> )}
              Nota Fiscal
            </button>
            <button 
              type="button" 
              disabled={isLoading}
              onClick={() => statementInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 border border-indigo-500 text-indigo-400 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? ( <LoaderIcon className="animate-spin h-5 w-5" /> ) : ( <CreditCardIcon className="h-5 w-5" /> )}
              Fatura
            </button>
        </div>
        
        {isLoading && <div className="text-center text-sm text-slate-400">Analisando... Isso pode levar um momento.</div>}

        <input id="receipt-upload" type="file" className="sr-only" ref={receiptInputRef} onChange={handleReceiptFileChange} accept="image/*,application/pdf"/>
        <input id="statement-upload" type="file" className="sr-only" ref={statementInputRef} onChange={handleStatementFileChange} accept="image/*,application/pdf"/>

        <div className="flex items-center text-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">OU CADASTRO MANUAL</span>
            <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg">
            <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500/80 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>Despesa</button>
            <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${type === TransactionType.INCOME ? 'bg-green-500/80 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>Receita</button>
        </div>

        <div className="flex-grow space-y-4">
            <div className="grid grid-cols-5 gap-4">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor (R$)" className="col-span-3 bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-2 bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>Selecione a Categoria</option>
                {currentCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <button type='button' title="Gerenciar categorias" onClick={() => setActiveView('Categorias')} className='p-3 bg-slate-800 rounded-lg hover:bg-slate-700'>
                <PlusCircleIcon className='w-6 h-6 text-slate-400'/>
              </button>
            </div>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (separadas por vírgula)" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-200">
          Adicionar Lançamento
        </button>
      </form>
    </section>
  );
};

export default TransactionForm;