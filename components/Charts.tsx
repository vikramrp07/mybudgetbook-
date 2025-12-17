import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction } from '../types';

interface ChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export const ExpensePieChart: React.FC<ChartsProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white p-4 text-gray-400 shadow-sm border border-gray-100">
        No expense data to display
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendBarChart: React.FC<ChartsProps> = ({ transactions }) => {
  const data = useMemo(() => {
    // Group by day (last 7 days with data or just recent)
    // simplified: just show last few transactions sorted by date
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by Date
    const grouped: Record<string, { date: string, income: number, expense: number }> = {};
    
    sorted.forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = { date: t.date.slice(5), income: 0, expense: 0 }; // show MM-DD
      }
      if (t.type === 'income') grouped[t.date].income += t.amount;
      else grouped[t.date].expense += t.amount;
    });

    return Object.values(grouped).slice(-7); // Last 7 active days
  }, [transactions]);

  if (data.length === 0) {
     return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white p-4 text-gray-400 shadow-sm border border-gray-100">
        No transaction data to display
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <h3 className="mb-4 text-sm font-semibold text-gray-600">Recent Activity (Daily)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
          <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`}/>
          <Tooltip 
             formatter={(value: number) => `$${value.toFixed(2)}`}
             cursor={{fill: '#f9fafb'}}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
