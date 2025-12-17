import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES } from '../types';
import { suggestCategory } from '../services/geminiService';

interface TransactionFormProps {
  initialData?: Transaction | null;
  defaultType?: TransactionType;
  onSave: (data: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, defaultType = 'expense', onSave, onClose }) => {
  const initialType = initialData?.type || defaultType;
  
  const [amount, setAmount] = useState<string>(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (initialType === 'income' ? 'Income' : 'Food'));
  const [type, setType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onSave({
      date,
      amount: parseFloat(amount),
      category,
      description,
      type
    });
    onClose();
  };

  const handleSuggestCategory = async () => {
    if (!description) return;
    setIsSuggesting(true);
    const suggested = await suggestCategory(description);
    if (CATEGORIES.includes(suggested)) {
      setCategory(suggested);
    }
    setIsSuggesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-200 rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Transaction' : (type === 'income' ? 'New Income' : 'New Expense')}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Type Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expense
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-7 pr-4 text-lg font-semibold text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder={type === 'income' ? "e.g. Salary, Freelance" : "e.g. Grocery shopping"}
                />
                <button 
                    type="button"
                    onClick={handleSuggestCategory}
                    disabled={!description || isSuggesting}
                    className="flex items-center justify-center rounded-xl bg-purple-100 p-2.5 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    title="AI Categorize"
                >
                    <Sparkles size={18} className={isSuggesting ? "animate-spin" : ""} />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full rounded-xl py-3 text-sm font-semibold text-white active:scale-[0.98] transition-all shadow-lg ${type === 'income' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {initialData ? 'Update Transaction' : (type === 'income' ? 'Add Income' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;