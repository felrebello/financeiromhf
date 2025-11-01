
import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { TrashIcon, PlusIcon } from './icons';

interface CategoryManagerProps {
  categories: Category[];
  addCategory: (name: string, type: TransactionType) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, addCategory, deleteCategory }) => {
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');

  const handleAddCategory = async (type: TransactionType) => {
    if (type === 'income' && newIncomeCategory.trim()) {
      await addCategory(newIncomeCategory.trim(), 'income');
      setNewIncomeCategory('');
    } else if (type === 'expense' && newExpenseCategory.trim()) {
      await addCategory(newExpenseCategory.trim(), 'expense');
      setNewExpenseCategory('');
    }
  };
  
  const renderCategoryList = (type: TransactionType) => {
    return categories
      .filter(c => c.type === type)
      .map(c => (
        <div key={c.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
          <span className="text-white">{c.name}</span>
          <button onClick={() => deleteCategory(c.id)} className="text-gray-500 hover:text-red-500">
            <TrashIcon />
          </button>
        </div>
      ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Income Categories */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-green-400">Categorias de Receita</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newIncomeCategory}
            onChange={(e) => setNewIncomeCategory(e.target.value)}
            placeholder="Nova categoria de receita"
            className="flex-grow bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={() => handleAddCategory('income')} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">{renderCategoryList('income')}</div>
      </div>
      {/* Expense Categories */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-red-400">Categorias de Despesa</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newExpenseCategory}
            onChange={(e) => setNewExpenseCategory(e.target.value)}
            placeholder="Nova categoria de despesa"
            className="flex-grow bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button onClick={() => handleAddCategory('expense')} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md">
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">{renderCategoryList('expense')}</div>
      </div>
    </div>
  );
};

export default CategoryManager;
