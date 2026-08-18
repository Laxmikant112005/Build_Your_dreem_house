import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetService } from '../../services/budgetService';
import { projectService } from '../../services/projectService';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus, ArrowRight, PieChart, List } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CATEGORY_COLORS = {
  labour: 'bg-blue-500', material: 'bg-emerald-500', equipment: 'bg-amber-500',
  permits: 'bg-purple-500', design: 'bg-pink-500', consultation: 'bg-teal-500',
  utilities: 'bg-orange-500', furnishing: 'bg-rose-500', landscaping: 'bg-green-500',
  miscellaneous: 'bg-slate-500',
};

const BudgetDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'material', description: '', amount: '', vendor: '' });
  const [newBudget, setNewBudget] = useState({ estimatedTotal: '', contingencyPercent: 10 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, summaryRes] = await Promise.all([
        projectService.getAll(),
        budgetService.getSummary(),
      ]);
      setProjects(projRes.data?.data || []);
      setSummary(summaryRes.data);

      // Load budgets for each project that has one
      const budgetMap = {};
      const expenseMap = {};
      for (const p of (projRes.data?.data || [])) {
        try {
          const bRes = await budgetService.getByProject(p._id);
          budgetMap[p._id] = bRes.data;
          expenseMap[p._id] = bRes.data?.expenses || [];
        } catch (e) { /* no budget yet */ }
      }
      setBudgets(budgetMap);
      setExpenses(expenseMap);
    } catch (err) {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await budgetService.create({
        projectId: selectedProject,
        estimatedTotal: Number(newBudget.estimatedTotal),
        contingencyPercent: Number(newBudget.contingencyPercent),
      });
      toast.success('Budget created!');
      setShowCreateBudget(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedProject || !budgets[selectedProject]) return;
    try {
      await budgetService.addExpense(budgets[selectedProject]._id, {
        ...newExpense,
        amount: Number(newExpense.amount),
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      setNewExpense({ category: 'material', description: '', amount: '', vendor: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div></div>;
  }

  return (
    <div className="space-y-8 py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-navy">Budget Management</h1>
        <p className="text-slate-600 mt-2">Track project budgets, expenses, and cost breakdowns</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-2xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
            </div>
            <p className="text-3xl font-black text-navy">{formatCurrency(summary.totalEstimated)}</p>
            <p className="text-sm text-slate-500">Total Estimated</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-100 rounded-2xl"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
            </div>
            <p className="text-3xl font-black text-navy">{formatCurrency(summary.totalActual)}</p>
            <p className="text-sm text-slate-500">Total Spent</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-100 rounded-2xl"><TrendingDown className="w-6 h-6 text-amber-600" /></div>
            </div>
            <p className="text-3xl font-black text-navy">{formatCurrency(summary.remaining)}</p>
            <p className="text-sm text-slate-500">Remaining</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-2xl ${summary.overBudgetCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${summary.overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-navy">{summary.overBudgetCount} / {summary.totalBudgets}</p>
            <p className="text-sm text-slate-500">Over Budget / Total</p>
          </div>
        </div>
      )}

      {/* Project Selection */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="p-3 border border-slate-200 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-gold/30"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name} {budgets[p._id] ? '(has budget)' : ''}</option>
          ))}
        </select>
        {selectedProject && !budgets[selectedProject] && (
          <button onClick={() => setShowCreateBudget(true)} className="btn-gold px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Budget
          </button>
        )}
        {selectedProject && budgets[selectedProject] && (
          <button onClick={() => setShowAddExpense(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
            <Plus className="w-5 h-5" /> Add Expense
          </button>
        )}
      </div>

      {/* Budget Overview */}
      {selectedProject && budgets[selectedProject] && (
        <div className="bg-white rounded-4xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-navy to-slate-800 p-8 text-white">
            <h2 className="text-2xl font-bold">Budget Overview</h2>
            <p className="text-white/70">Estimated: {formatCurrency(budgets[selectedProject].estimatedTotal)}</p>
          </div>
          <div className="p-8 space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-navy">Progress</span>
                <span className="text-sm text-slate-500">
                  {formatCurrency(budgets[selectedProject].totalActual)} of {formatCurrency(budgets[selectedProject].estimatedTotal)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgets[selectedProject].overBudget > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (budgets[selectedProject].totalActual / budgets[selectedProject].estimatedTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Category Breakdown */}
            <h3 className="font-bold text-lg text-navy mt-8 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> Category Breakdown
            </h3>
            <div className="space-y-4">
              {budgets[selectedProject].categories.map((cat) => {
                const pct = cat.estimated > 0 ? Math.round((cat.actual / cat.estimated) * 100) : 0;
                const color = CATEGORY_COLORS[cat.name] || 'bg-slate-400';
                return (
                  <div key={cat.name} className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="font-bold text-navy">{cat.label}</span>
                      </div>
                      <span className="text-sm text-slate-500">{formatCurrency(cat.actual)} / {formatCurrency(cat.estimated)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <div className={`text-xs mt-1 ${pct > 100 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                      {pct}% used {pct > 100 ? `(over by ${formatCurrency(cat.actual - cat.estimated)})` : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expense History */}
            <h3 className="font-bold text-lg text-navy mt-8 mb-4 flex items-center gap-2">
              <List className="w-5 h-5" /> Expense History
            </h3>
            {budgets[selectedProject].expenses.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No expenses recorded yet. Click "Add Expense" to start tracking.</p>
            ) : (
              <div className="space-y-3">
                {[...budgets[selectedProject].expenses].reverse().map((exp, i) => (
                  <div key={exp._id || i} className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[exp.category] || 'bg-slate-400'}`} />
                      <div>
                        <p className="font-bold text-navy">{exp.description}</p>
                        <p className="text-sm text-slate-400">
                          {budgets[selectedProject].categories.find(c => c.name === exp.category)?.label || exp.category}
                          {exp.vendor ? ` • ${exp.vendor}` : ''} • {new Date(exp.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-navy">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contingency Info */}
          <div className="bg-amber-50 border-t border-amber-200 p-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-800">
              Contingency buffer: {budgets[selectedProject].contingencyPercent}% ({formatCurrency(budgets[selectedProject].estimatedTotal * budgets[selectedProject].contingencyPercent / 100)})
            </span>
          </div>
        </div>
      )}

      {/* No selection */}
      {!selectedProject && (
        <div className="text-center py-20 bg-slate-50 rounded-4xl border border-slate-200">
          <DollarSign className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-navy mb-2">Select a Project</h3>
          <p className="text-slate-500">Choose a project above to view or create its budget</p>
        </div>
      )}

      {/* Create Budget Modal */}
      {showCreateBudget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateBudget(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Create Budget</h3>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Total (₹)</label>
                <input type="number" required min="0" value={newBudget.estimatedTotal}
                  onChange={e => setNewBudget({...newBudget, estimatedTotal: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contingency (%)</label>
                <input type="number" min="0" max="50" value={newBudget.contingencyPercent}
                  onChange={e => setNewBudget({...newBudget, contingencyPercent: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateBudget(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-gold text-navy rounded-2xl font-bold">Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddExpense(false)}>
          <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-navy mb-6">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30">
                  {Object.entries(CATEGORY_COLORS).map(([key]) => (
                    <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <input required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹)</label>
                <input type="number" required min="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vendor (optional)</label>
                <input value={newExpense.vendor} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 p-3 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-emerald-500 text-white rounded-2xl font-bold">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;

