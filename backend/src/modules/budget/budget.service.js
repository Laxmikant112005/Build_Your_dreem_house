/**
 * Planova - Budget Service
 */
const mongoose = require('mongoose');
const Budget = require('./budget.model');
const ApiError = require('../../utils/ApiError');

const DEFAULT_CATEGORIES = [
  { name: 'labour', label: 'Labour', estimated: 0, actual: 0 },
  { name: 'material', label: 'Material', estimated: 0, actual: 0 },
  { name: 'equipment', label: 'Equipment', estimated: 0, actual: 0 },
  { name: 'permits', label: 'Permits & Approvals', estimated: 0, actual: 0 },
  { name: 'design', label: 'Design & Engineering', estimated: 0, actual: 0 },
  { name: 'consultation', label: 'Consultation', estimated: 0, actual: 0 },
  { name: 'utilities', label: 'Utilities', estimated: 0, actual: 0 },
  { name: 'furnishing', label: 'Furnishing & Interiors', estimated: 0, actual: 0 },
  { name: 'landscaping', label: 'Landscaping', estimated: 0, actual: 0 },
  { name: 'miscellaneous', label: 'Miscellaneous', estimated: 0, actual: 0 },
];

class BudgetService {
  async createBudget(userId, data) {
    const existing = await Budget.findOne({ projectId: data.projectId, userId });
    if (existing) throw new ApiError(409, 'Budget already exists for this project');

    const categories = DEFAULT_CATEGORIES.map(cat => {
      const userCat = data.categories?.find(uc => uc.name === cat.name);
      return {
        ...cat,
        estimated: userCat?.estimated || 0,
        label: userCat?.label || cat.label,
      };
    });

    const budget = await Budget.create({
      ...data,
      userId,
      categories,
    });
    return budget;
  }

  async getBudgetByProject(projectId, userId) {
    const budget = await Budget.findOne({ projectId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found for this project');
    return budget;
  }

  async getBudgetById(budgetId, userId) {
    if (!mongoose.Types.ObjectId.isValid(budgetId)) throw new ApiError(400, 'Invalid ID');
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found');
    return budget;
  }

  async updateBudget(budgetId, userId, data) {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found');

    if (data.estimatedTotal !== undefined) budget.estimatedTotal = data.estimatedTotal;
    if (data.contingencyPercent !== undefined) budget.contingencyPercent = data.contingencyPercent;
    if (data.notes !== undefined) budget.notes = data.notes;
    if (data.categories) {
      data.categories.forEach(uc => {
        const cat = budget.categories.find(c => c.name === uc.name);
        if (cat) {
          if (uc.estimated !== undefined) cat.estimated = uc.estimated;
          if (uc.actual !== undefined) cat.actual = uc.actual;
        }
      });
    }
    await budget.save();
    return budget;
  }

  async addExpense(budgetId, userId, expenseData) {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found');

    const category = budget.categories.find(c => c.name === expenseData.category);
    if (!category) throw new ApiError(400, 'Invalid expense category');

    const expense = {
      ...expenseData,
      createdBy: userId,
      date: expenseData.date || new Date(),
    };

    budget.expenses.push(expense);
    category.actual = (category.actual || 0) + expenseData.amount;
    await budget.save();
    return budget;
  }

  async deleteExpense(budgetId, userId, expenseId) {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found');

    const expense = budget.expenses.id(expenseId);
    if (!expense) throw new ApiError(404, 'Expense not found');

    const category = budget.categories.find(c => c.name === expense.category);
    if (category) category.actual = Math.max(0, (category.actual || 0) - expense.amount);

    budget.expenses.pull(expenseId);
    await budget.save();
    return budget;
  }

  async getBudgetSummary(userId) {
    const budgets = await Budget.find({ userId });
    const totalEstimated = budgets.reduce((s, b) => s + b.estimatedTotal, 0);
    const totalActual = budgets.reduce((s, b) => s + b.totalActual, 0);
    const overBudget = budgets.filter(b => b.overBudget > 0).length;
    const onTrack = budgets.filter(b => b.status === 'active' && b.overBudget === 0).length;

    return {
      totalBudgets: budgets.length,
      totalEstimated,
      totalActual,
      remaining: totalEstimated - totalActual,
      overBudgetCount: overBudget,
      onTrackCount: onTrack,
    };
  }

  async getCategoryBreakdown(projectId, userId) {
    const budget = await Budget.findOne({ projectId, userId });
    if (!budget) throw new ApiError(404, 'Budget not found');
    return budget.categories.map(cat => ({
      name: cat.name,
      label: cat.label,
      estimated: cat.estimated,
      actual: cat.actual,
      variance: cat.estimated - cat.actual,
      percentUsed: cat.estimated > 0 ? Math.round((cat.actual / cat.estimated) * 100) : 0,
    }));
  }
}

module.exports = new BudgetService();

