/**
 * Planova - Document Controller
 */
const documentService = require('./document.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.createDocument(req.userId, req.body);
  ApiResponse.created(res, 'Document created successfully', doc);
});

const getDocuments = asyncHandler(async (req, res) => {
  const { page, limit, category, folder, isFavorite, isArchived, search, sortBy, sortOrder, projectId, propertyId } = req.query;
  const result = await documentService.getUserDocuments(req.userId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    category, folder, isFavorite: isFavorite === 'true', isArchived: isArchived === 'true',
    search, sortBy, sortOrder, projectId, propertyId,
  });
  ApiResponse.paginated(res, 'Documents retrieved successfully', result.documents, result.pagination);
});

const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await documentService.getDocumentById(req.params.id, req.userId);
  ApiResponse.ok(res, 'Document retrieved successfully', doc);
});

const updateDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.updateDocument(req.params.id, req.userId, req.body);
  ApiResponse.ok(res, 'Document updated successfully', doc);
});

const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id, req.userId);
  ApiResponse.ok(res, 'Document deleted successfully');
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const doc = await documentService.toggleFavorite(req.params.id, req.userId);
  ApiResponse.ok(res, doc.isFavorite ? 'Added to favorites' : 'Removed from favorites', doc);
});

const toggleArchive = asyncHandler(async (req, res) => {
  const doc = await documentService.archiveDocument(req.params.id, req.userId);
  ApiResponse.ok(res, doc.isArchived ? 'Document archived' : 'Document restored', doc);
});

const getFolders = asyncHandler(async (req, res) => {
  const folders = await documentService.getUserDocuments(req.userId, { limit: 1 });
  ApiResponse.ok(res, 'Folders retrieved', { folders: folders.folders, categoryCounts: folders.categoryCounts });
});

const createFolder = asyncHandler(async (req, res) => {
  const folder = await documentService.createFolder(req.userId, req.body.name);
  ApiResponse.created(res, 'Folder created', folder);
});

const moveToFolder = asyncHandler(async (req, res) => {
  const doc = await documentService.moveToFolder(req.params.id, req.userId, req.body.folder);
  ApiResponse.ok(res, 'Document moved to folder', doc);
});

const getRecent = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const docs = await documentService.getRecentDocuments(req.userId, limit);
  ApiResponse.ok(res, 'Recent documents retrieved', docs);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await documentService.getStorageStats(req.userId);
  ApiResponse.ok(res, 'Storage stats retrieved', stats);
});

module.exports = {
  createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument,
  toggleFavorite, toggleArchive, getFolders, createFolder, moveToFolder, getRecent, getStats,
};

