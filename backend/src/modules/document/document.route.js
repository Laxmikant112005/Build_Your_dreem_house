const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateJoi } = require('../../middleware/joi.middleware');
const documentValidator = require('./document.validator');

router.use(authenticate);

// Folders
router.get('/folders', documentController.getFolders);
router.post('/folders', validateJoi(documentValidator.createFolder, 'body'), documentController.createFolder);
router.put('/:id/move', documentController.moveToFolder);

// CRUD
router.post('/', validateJoi(documentValidator.createDocument, 'body'), documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/recent', documentController.getRecent);
router.get('/stats', documentController.getStats);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', validateJoi(documentValidator.updateDocument, 'body'), documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Actions
router.post('/:id/favorite', documentController.toggleFavorite);
router.post('/:id/archive', documentController.toggleArchive);

module.exports = router;

