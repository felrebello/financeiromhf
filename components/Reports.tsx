import React from 'react';
import { Transaction, Category } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, categories }) => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const dataByCategory = categories
    .filter(c => c.type === 'expense')
    .map(category => {
      const total = expenseTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: category.name, value: total };
    })
    .filter(item => item.value > 0);

  const dataByMonth = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { name: month, income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {} as { [key: string]: { name: string; income: number; expense: number } });

  // FIX: Explicitly type sort callback arguments to resolve TypeScript inference issue.
  const monthlyChartData = Object.values(dataByMonth).sort((a: { name: string }, b: { name: string }) => {
      const [m1, y1] = a.name.split(' ');
      const [m2, y2] = b.name.split(' ');
      const d1 = new Date(`01-${m1}-20${y1}`);
      const d2 = new Date(`01-${m2}-20${y2}`);
      return d1.getTime() - d2.getTime();
  });


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19B2FF'];

  return (
    <div className="space-y-8">
       <h2 className="text-3xl font-bold text-white">Relatórios</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Despesas por Categoria</h3>
          {dataByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-20">Sem dados de despesa para exibir.</p>}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Receitas vs. Despesas Mensal</h3>
          {monthlyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" tickFormatter={(value: number) => `R$${value/1000}k`} />
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend />
              <Bar dataKey="income" fill="#48BB78" name="Receita" />
              <Bar dataKey="expense" fill="#F56565" name="Despesa" />
            </BarChart>
          </ResponsiveContainer>
           ) : <p className="text-gray-400 text-center py-20">Sem dados para exibir.</p>}
        </div>
      </div>
    </div>
  );
};

export default Reports;