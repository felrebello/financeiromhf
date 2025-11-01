import React, { useState, useEffect } from 'react';
import { Transaction, Category, AuthUser, TransactionType, ScannedReceiptData, User } from '../types';
import { CameraIcon, PlusIcon } from './icons';

interface TransactionFormProps {
  loggedInUser: AuthUser;
  currentUser: User;
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  addCategory: (name: string, type: TransactionType) => Promise<string>; // Returns new category ID
  onScanReceiptClick: () => void;
  initialData?: ScannedReceiptData | null;
  clearInitialData: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
    loggedInUser, currentUser, categories, addTransaction, addCategory,
    onScanReceiptClick, initialData, clearInitialData 
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount?.toString() || '');
      setDescription(initialData.description || '');
      const scannedDate = new Date(initialData.date);
      if (!isNaN(scannedDate.getTime())) {
         const timeZoneOffset = scannedDate.getTimezoneOffset() * 60000;
         const adjustedDate = new Date(scannedDate.getTime() + timeZoneOffset);
         setDate(adjustedDate.toISOString().slice(0, 10));
      } else {
         setDate(new Date().toISOString().slice(0, 10));
      }
      setType('expense');
      setCategoryId('');
      clearInitialData();
    }
  }, [initialData, clearInitialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId || !date || isSubmitting) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    
    setIsSubmitting(true);

    await addTransaction({
      uid: loggedInUser.uid,
      userName: currentUser,
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date,
      tags: type === 'expense' ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    });

    setAmount('');
    setDescription('');
    setCategoryId('');
    setTags('');
    setDate(new Date().toISOString().slice(0, 10));
    setIsSubmitting(false);
  };

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      const newId = await addCategory(newCategoryName, type);
      setCategoryId(newId);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };


  return (
    <>
    {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4 text-white">Adicionar Categoria de {type === 'income' ? 'Receita' : 'Despesa'}</h3>
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria"
                    className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAddingCategory(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white">Cancelar</button>
                    <button onClick={handleAddNewCategory} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold">Adicionar</button>
                </div>
            </div>
        </div>
    )}

    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Novo Lançamento ({currentUser})</h2>
       <button
        type="button"
        onClick={onScanReceiptClick}
        className="w-full flex items-center justify-center gap-2 mb-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
      >
        <CameraIcon className="w-5 h-5" />
        Escanear Nota Fiscal (Beta)
      </button>

      <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 uppercase text-sm">Ou</span>
          <div className="flex-grow border-t border-gray-600"></div>
      </div>

      <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => { setType('expense'); setCategoryId(''); }}
          className={`py-2 px-4 font-semibold ${type === 'expense' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
        >
          Despesa
        </button>
        <button
          onClick={() => { setType('income'); setCategoryId(''); }}
          className={`py-2 px-4 font-semibold ${type === 'income' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
        >
          Receita
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Valor (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex items-center gap-2">
            <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-grow bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <option value="">Selecione a Categoria</option>
            {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            </select>
            <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-md flex-shrink-0"
                title="Adicionar nova categoria"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
        {type === 'expense' && (
          <input
            type="text"
            placeholder="Tags (separadas por vírgula)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Adicionando...' : 'Adicionar Lançamento'}
        </button>
      </form>
    </div>
    </>
  );
};

export default TransactionForm;
