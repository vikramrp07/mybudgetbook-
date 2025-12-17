import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutDashboard, List, MessageSquareText, TrendingUp, TrendingDown, Wallet, Trash2, Edit2, Search } from 'lucide-react';
import { Transaction, BudgetSummary, TransactionType, BudgetGoal } from './types';
import TransactionForm from './components/TransactionForm';
import AIChat from './components/AIChat';
import BudgetGoalModal from './components/BudgetGoalModal';
import BudgetProgress from './components/BudgetProgress';
import { ExpensePieChart, TrendBarChart } from './components/Charts';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'ai'>('dashboard');
  
  // Transaction State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Budget Goal State
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>(() => {
    const saved = localStorage.getItem('budget_goals');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>('expense');

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget_goals', JSON.stringify(budgetGoals));
  }, [budgetGoals]);

  const summary = useMemo<BudgetSummary>(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        else acc.totalExpense += t.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  // Update balance
  summary.balance = summary.totalIncome - summary.totalExpense;

  const handleSaveTransaction = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...data, id: t.id } : t));
    } else {
      setTransactions(prev => [{ ...data, id: generateId() }, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <div className="p-2 bg-white/20 rounded-lg"><Wallet size={20} /></div>
            <span className="text-sm font-medium">Total Balance</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">${summary.balance.toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
              <span className="text-sm font-medium text-gray-500">Income</span>
             </div>
             <button 
               onClick={() => { setFormDefaultType('income'); setEditingTransaction(null); setIsFormOpen(true); }}
               className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
               title="Add Income"
             >
               <Plus size={16} />
             </button>
           </div>
          <h2 className="text-2xl font-bold text-gray-900">${summary.totalIncome.toFixed(2)}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
            <span className="text-sm font-medium text-gray-500">Expenses</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">${summary.totalExpense.toFixed(2)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
             <TrendBarChart transactions={transactions} />
             <ExpensePieChart transactions={transactions} />
        </div>
        
        {/* Budget Progress Section - Takes up 1 column on large screens */}
        <div className="lg:col-span-1">
             <BudgetProgress 
                transactions={transactions} 
                goals={budgetGoals} 
                onManage={() => setIsBudgetModalOpen(true)} 
             />
        </div>
      </div>

       {/* Quick Recent Transactions */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                <button onClick={() => setActiveTab('transactions')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
                {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {t.category.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{t.description}</p>
                                <p className="text-xs text-gray-500">{t.date} • {t.category}</p>
                            </div>
                        </div>
                        <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                    </div>
                ))}
                {transactions.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No recent transactions</div>}
            </div>
       </div>
    </div>
  );

  const TransactionsView = () => {
    const [filter, setFilter] = useState('');
    const filtered = transactions.filter(t => 
        t.description.toLowerCase().includes(filter.toLowerCase()) || 
        t.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-300 pb-24 h-full flex flex-col">
            <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="space-y-3">
                {filtered.map(t => (
                    <div key={t.id} className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{t.description}</h4>
                                <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{t.category}</span>
                                    <span>{t.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                             <span className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 opacity-100">
                                <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3"><List size={32} /></div>
                        <p>No transactions found</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Wallet size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">SmartBudget</h1>
          </div>
          <div className="hidden md:flex items-center gap-1">
             <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</button>
             <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Transactions</button>
             <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>Gemini Insights</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-4 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'ai' && (
            <div className="h-[calc(100vh-140px)] md:h-[600px]">
                <AIChat transactions={transactions} onClose={() => setActiveTab('dashboard')} />
            </div>
        )}
      </main>

      {/* FAB: Add Transaction (Visible on Dashboard/Transactions) */}
      {activeTab !== 'ai' && (
        <button
            onClick={() => { setFormDefaultType('expense'); setEditingTransaction(null); setIsFormOpen(true); }}
            className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300 transition-transform active:scale-90 hover:bg-blue-700"
            title="Add Transaction"
        >
            <Plus size={28} />
        </button>
      )}

      {/* Transaction Modal */}
      {isFormOpen && (
        <TransactionForm
          initialData={editingTransaction}
          defaultType={formDefaultType}
          onSave={handleSaveTransaction}
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        />
      )}

      {/* Budget Goal Modal */}
      {isBudgetModalOpen && (
        <BudgetGoalModal
          currentGoals={budgetGoals}
          onSave={setBudgetGoals}
          onClose={() => setIsBudgetModalOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-gray-200 bg-white px-2 pb-safe pt-2">
        <div className="flex justify-around items-end pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
           <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'transactions' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={24} strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">History</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'ai' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquareText size={24} strokeWidth={activeTab === 'ai' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Gemini</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;