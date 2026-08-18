/**
 * Planova - Project Routes
 * API routes for construction project management
 */

const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { param } = require('express-validator');
const projectValidator = require('./project.validator');
const { validateJoi } = require('../../middleware/joi.middleware');

// All routes require authentication
router.use(authenticate);

// CRUD
router.post('/', validateJoi(projectValidator.createProject, 'body'), projectController.createProject);
router.get('/', projectController.getUserProjects);
// Must be defined before the dynamic /:id route
router.get('/assigned', projectController.getAssignedProjects);
router.get('/assigned/:id', param('id').isMongoId(), validate, projectController.getProjectById);
router.get('/:id', param('id').isMongoId(), validate, projectController.getProjectById);
router.put('/:id', param('id').isMongoId(), validateJoi(projectValidator.updateProject, 'body'), validate, projectController.updateProject);
router.patch('/:id/status', param('id').isMongoId(), validateJoi(projectValidator.updateStatus, 'body'), validate, projectController.updateProjectStatus);
router.delete('/:id', param('id').isMongoId(), validate, projectController.deleteProject);

// Milestones
router.post('/:id/milestones', param('id').isMongoId(), validateJoi(projectValidator.addMilestone, 'body'), validate, projectController.addMilestone);
router.put('/:id/milestones/:milestoneId', param('id').isMongoId(), param('milestoneId').isMongoId(), validateJoi(projectValidator.updateMilestone, 'body'), validate, projectController.updateMilestone);

// Progress stages
router.patch('/:id/stages/:stageIndex', param('id').isMongoId(), validateJoi(projectValidator.updateStage, 'body'), validate, projectController.updateStage);

// Documents
router.post('/:id/documents', param('id').isMongoId(), validateJoi(projectValidator.addDocument, 'body'), validate, projectController.addDocument);
router.delete('/:id/documents/:documentId', param('id').isMongoId(), param('documentId').isMongoId(), validate, projectController.removeDocument);

// Members
router.post('/:id/members', param('id').isMongoId(), validateJoi(projectValidator.inviteMember, 'body'), validate, projectController.inviteMember);
router.delete('/:id/members/:memberId', param('id').isMongoId(), param('memberId').isMongoId(), validate, projectController.removeMember);

module.exports = router;

