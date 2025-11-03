import React, { useState } from 'react';
import { Category, Categories } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckIcon, CloseIcon } from './icons';

interface CategoryManagerProps {
  categories: Categories;
  addCategory: (name: string, type: 'income' | 'expense') => void;
  updateCategory: (id: string, newName: string, type: 'income' | 'expense') => void;
  deleteCategory: (id: string, type: 'income' | 'expense') => void;
}

const CategoryList: React.FC<{
    categories: Category[];
    type: 'income' | 'expense';
    updateCategory: (id: string, newName: string, type: 'income' | 'expense') => void;
    deleteCategory: (id: string, type: 'income' | 'expense') => void;
}> = ({ categories, type, updateCategory, deleteCategory }) => {
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    const handleEditStart = (category: Category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryName(category.name);
    };

    const handleEditCancel = () => {
        setEditingCategoryId(null);
        setEditingCategoryName('');
    };

    const handleEditSave = () => {
        if (editingCategoryId && editingCategoryName.trim()) {
            updateCategory(editingCategoryId, editingCategoryName.trim(), type);
            handleEditCancel();
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria? As transações existentes com esta categoria não serão alteradas.')) {
            deleteCategory(id, type);
        }
    };
    
    if (categories.length === 0) {
        return <p className="text-slate-500 text-center py-4">Nenhuma categoria encontrada.</p>;
    }

    return (
        <ul className="space-y-3">
            {categories.map(category => (
                <li key={category.id} className="flex items-center justify-between p-4 bg-slate-800/70 rounded-lg">
                    {editingCategoryId === category.id ? (
                        <div className="flex-grow flex items-center gap-2">
                            <input
                                type="text"
                                value={editingCategoryName}
                                onChange={e => setEditingCategoryName(e.target.value)}
                                className="flex-grow bg-slate-700 border-slate-600 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                            <button onClick={handleEditSave} className="p-2 text-green-400 hover:bg-slate-700 rounded-full"><CheckIcon className="w-5 h-5" /></button>
                            <button onClick={handleEditCancel} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full"><CloseIcon className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <>
                            <span className="text-slate-200">{category.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditStart(category)} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-full transition-colors">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
};

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, addCategory, updateCategory, deleteCategory }) => {
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim(), activeTab);
            setNewCategoryName('');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Gerenciar Categorias</h2>
            
            <div className="mb-6">
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('expense')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'expense' ? 'bg-red-500/80 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>Despesas</button>
                    <button onClick={() => setActiveTab('income')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'income' ? 'bg-green-500/80 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>Receitas</button>
                </div>
            </div>
            
            <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder={`Nova categoria de ${activeTab === 'expense' ? 'despesa' : 'receita'}`}
                    className="flex-grow bg-slate-800 border-slate-700 rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Adicionar</span>
                </button>
            </form>

            <div>
                {activeTab === 'expense' && <CategoryList categories={categories.expense} type="expense" updateCategory={updateCategory} deleteCategory={deleteCategory} />}
                {activeTab === 'income' && <CategoryList categories={categories.income} type="income" updateCategory={updateCategory} deleteCategory={deleteCategory} />}
            </div>
        </div>
    );
};

export default CategoryManager;