import React, { useMemo } from 'react';
import { Transaction, BudgetGoal } from '../types';

interface BudgetProgressProps {
  transactions: Transaction[];
  goals: BudgetGoal[];
  onManage: () => void;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ transactions, goals, onManage }) => {
  const progressData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter for current month expense transactions
    const monthlyExpenses = transactions.filter(t => {
      // Parse date manually to avoid timezone issues, assume stored as YYYY-MM-DD
      const [year, month] = t.date.split('-').map(Number);
      return t.type === 'expense' && (month - 1) === currentMonth && year === currentYear;
    });

    return goals.map(goal => {
      const spent = monthlyExpenses
        .filter(t => t.category === goal.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...goal,
        spent,
        percentage: Math.min((spent / goal.limit) * 100, 100),
        isOverBudget: spent > goal.limit
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by highest usage
  }, [transactions, goals]);

  if (goals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <h3 className="font-semibold text-gray-800 mb-2">Monthly Budgets</h3>
        <p className="text-sm text-gray-500 mb-4">Set category limits to track your monthly spending goals.</p>
        <button onClick={onManage} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
          Set Budgets
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Monthly Budgets</h3>
        <button onClick={onManage} className="text-xs font-medium text-blue-600 hover:text-blue-700">Manage</button>
      </div>
      
      <div className="space-y-4">
        {progressData.map(item => {
           let colorClass = 'bg-green-500';
           if (item.percentage >= 90) colorClass = 'bg-red-500';
           else if (item.percentage >= 75) colorClass = 'bg-yellow-500';

           return (
            <div key={item.category}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="text-gray-500">
                  <span className={item.isOverBudget ? "text-red-600 font-bold" : "text-gray-900"}>${item.spent.toFixed(0)}</span>
                  <span className="text-xs"> / ${item.limit}</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;