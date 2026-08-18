/**
 * Planova - Collection Controller
 */

const collectionService = require('./collection.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(req.userId, req.body);
  ApiResponse.created(res, 'Collection created', collection);
});

const getCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.getUserCollections(req.userId);
  ApiResponse.ok(res, 'Collections retrieved', collections);
});

const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(req.params.id);
  ApiResponse.ok(res, 'Collection retrieved', collection);
});

const updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(req.params.id, req.userId, req.body);
  ApiResponse.ok(res, 'Collection updated', collection);
});

const deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.params.id, req.userId);
  ApiResponse.ok(res, 'Collection deleted');
});

const addItem = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body;
  const collection = await collectionService.addItem(req.params.id, req.userId, itemType, itemId);
  ApiResponse.ok(res, 'Item added to collection', collection);
});

const removeItem = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body;
  const collection = await collectionService.removeItem(req.params.id, req.userId, itemType, itemId);
  ApiResponse.ok(res, 'Item removed from collection', collection);
});

const toggleItem = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body;
  const result = await collectionService.toggleItem(req.userId, itemType, itemId);
  ApiResponse.ok(res, result.saved ? 'Item saved' : 'Item unsaved', result);
});

module.exports = {
  createCollection, getCollections, getCollectionById,
  updateCollection, deleteCollection, addItem, removeItem, toggleItem,
};

