const express = require('express');
const router = express.Router();
const budgetController = require('./budget.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateJoi } = require('../../middleware/joi.middleware');
const budgetValidator = require('./budget.validator');

router.use(authenticate);

router.post('/', validateJoi(budgetValidator.createBudget, 'body'), budgetController.createBudget);
router.get('/summary', budgetController.getBudgetSummary);
router.get('/project/:projectId', budgetController.getBudgetByProject);
router.get('/project/:projectId/breakdown', budgetController.getCategoryBreakdown);
router.get('/:id', budgetController.getBudgetById);
router.put('/:id', validateJoi(budgetValidator.updateBudget, 'body'), budgetController.updateBudget);
router.post('/:id/expenses', validateJoi(budgetValidator.addExpense, 'body'), budgetController.addExpense);
router.delete('/:id/expenses/:expenseId', budgetController.deleteExpense);

module.exports = router;

