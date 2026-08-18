/**
 * Planova - Budget Controller
 */
const budgetService = require('./budget.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.userId, req.body);
  ApiResponse.created(res, 'Budget created successfully', budget);
});

const getBudgetByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const budget = await budgetService.getBudgetByProject(projectId, req.userId);
  ApiResponse.ok(res, 'Budget retrieved successfully', budget);
});

const getBudgetById = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetById(req.params.id, req.userId);
  ApiResponse.ok(res, 'Budget retrieved successfully', budget);
});

const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.userId, req.body);
  ApiResponse.ok(res, 'Budget updated successfully', budget);
});

const addExpense = asyncHandler(async (req, res) => {
  const budget = await budgetService.addExpense(req.params.id, req.userId, req.body);
  ApiResponse.created(res, 'Expense added successfully', budget);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const budget = await budgetService.deleteExpense(req.params.id, req.userId, req.params.expenseId);
  ApiResponse.ok(res, 'Expense deleted successfully', budget);
});

const getBudgetSummary = asyncHandler(async (req, res) => {
  const summary = await budgetService.getBudgetSummary(req.userId);
  ApiResponse.ok(res, 'Budget summary retrieved', summary);
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const breakdown = await budgetService.getCategoryBreakdown(projectId, req.userId);
  ApiResponse.ok(res, 'Category breakdown retrieved', breakdown);
});

module.exports = {
  createBudget, getBudgetByProject, getBudgetById, updateBudget,
  addExpense, deleteExpense, getBudgetSummary, getCategoryBreakdown,
};

