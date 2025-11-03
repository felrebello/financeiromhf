import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface ReportsPageProps {
  transactions: Transaction[];
}

const colors = [
    '#34d399', '#f87171', '#60a5fa', '#facc15', '#a78bfa',
    '#fb923c', '#2dd4bf', '#f472b6', '#818cf8', '#a3e635'
];

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PieChart: React.FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-full"><p className="text-slate-500">Nenhuma despesa para exibir</p></div>;
    }

    let cumulativePercentage = 0;
    const gradients = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const color = colors[index % colors.length];
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${color} ${start}% ${end}%`;
    });

    return (
        <div className="flex justify-center items-center">
            <div
                className="w-64 h-64 rounded-full"
                style={{ background: `conic-gradient(${gradients.join(', ')})` }}
                role="img"
                aria-label="Gráfico de pizza de despesas por categoria"
            ></div>
        </div>
    );
};

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const expenseByCategory = useMemo(() => {
        const categoryMap = new Map<string, number>();
        expenses.forEach(t => {
            categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
        });
        return Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);
    
    const top5Expenses = transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .sort((a,b) => b.amount - a.amount)
        .slice(0,5);
        
    const top5Incomes = transactions
        .filter(t => t.type === TransactionType.INCOME)
        .sort((a,b) => b.amount - a.amount)
        .slice(0,5);

    return (
        <div className="animate-fade-in">
            <header className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <h2 className="text-3xl font-bold text-slate-100">Relatórios Financeiros</h2>
                <p className="text-slate-400 mt-1">Uma visão geral da sua saúde financeira.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-100 mb-4">Despesas por Categoria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <PieChart data={expenseByCategory} />
                        <ul className="space-y-2 text-sm">
                            {expenseByCategory.map((item, index) => (
                                <li key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                                        <span className="text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-200">{formatCurrency(item.value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <div className="space-y-8">
                    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Top 5 Despesas</h3>
                        <ul className="space-y-3">
                            {top5Expenses.length > 0 ? top5Expenses.map(t => (
                                <li key={t.id} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-md">
                                    <span className="text-slate-300 truncate pr-2">{t.description}</span>
                                    <span className="font-semibold text-red-400">{formatCurrency(t.amount)}</span>
                                </li>
                            )) : <p className="text-slate-500 text-sm">Nenhuma despesa registrada.</p>}
                        </ul>
                    </section>
                    
                    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Top 5 Receitas</h3>
                        <ul className="space-y-3">
                             {top5Incomes.length > 0 ? top5Incomes.map(t => (
                                <li key={t.id} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded-md">
                                    <span className="text-slate-300 truncate pr-2">{t.description}</span>
                                    <span className="font-semibold text-green-400">{formatCurrency(t.amount)}</span>
                                </li>
                            )) : <p className="text-slate-500 text-sm">Nenhuma receita registrada.</p>}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;