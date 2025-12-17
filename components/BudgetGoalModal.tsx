import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, BudgetGoal } from '../types';

interface BudgetGoalModalProps {
  currentGoals: BudgetGoal[];
  onSave: (goals: BudgetGoal[]) => void;
  onClose: () => void;
}

const BudgetGoalModal: React.FC<BudgetGoalModalProps> = ({ currentGoals, onSave, onClose }) => {
  const [goals, setGoals] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    CATEGORIES.forEach(cat => {
      const existing = currentGoals.find(g => g.category === cat);
      map[cat] = existing ? existing.limit.toString() : '';
    });
    return map;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoals: BudgetGoal[] = Object.entries(goals)
      .map(([category, limit]) => ({
        category,
        limit: parseFloat(limit as string) || 0
      }))
      .filter(g => g.limit > 0);
    
    onSave(newGoals);
    onClose();
  };

  const handleChange = (category: string, value: string) => {
    setGoals(prev => ({ ...prev, [category]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h2 className="text-lg font-bold text-gray-800">Set Monthly Budgets</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-500 mb-2">Set a monthly limit for each category. Leave empty or 0 to disable.</p>
          {CATEGORIES.filter(c => c !== 'Income').map(category => (
            <div key={category} className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-gray-700 w-1/3">{category}</label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="No limit"
                  value={goals[category]}
                  onChange={(e) => handleChange(category, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-7 pr-4 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          ))}
        </form>

        <div className="p-4 border-t bg-gray-50">
           <button
              onClick={handleSave}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
            >
              Save Budgets
            </button>
        </div>
      </div>
    </div>
  );
};
export default BudgetGoalModal;