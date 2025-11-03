import React from 'react';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-1">Receita Total</p>
        <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-1">Despesa Total</p>
        <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-1">Saldo Atual</p>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </section>
  );
};

export default Dashboard;