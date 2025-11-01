
import React from 'react';
import { Transaction } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400">Receita Total</h3>
        <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400">Despesa Total</h3>
        <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-400">Saldo Atual</h3>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
