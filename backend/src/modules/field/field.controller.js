/**
 * Field Controller
 */

const fieldService = require('./field.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const createField = asyncHandler(async (req, res) => {
  const field = await fieldService.createField(req.userId, req.body);
  ApiResponse.created(res, 'Field created successfully', field);
});

const getUserFields = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const fields = await fieldService.getUserFields(req.userId, { page: parseInt(page), limit: parseInt(limit) });
  ApiResponse.ok(res, 'Fields retrieved successfully', fields);
});

const getField = asyncHandler(async (req, res) => {
  const field = await fieldService.getFieldById(req.params.id);
  if (field.userId.toString() !== req.userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  ApiResponse.ok(res, 'Field retrieved successfully', field);
});

const updateField = asyncHandler(async (req, res) => {
  const field = await fieldService.updateField(req.params.id, req.body);
  if (field.userId.toString() !== req.userId) {
    throw new ApiError(403, 'Unauthorized');
  }
  ApiResponse.ok(res, 'Field updated successfully', field);
});

const setPrimaryField = asyncHandler(async (req, res) => {
  const field = await fieldService.setPrimaryField(req.userId, req.params.id);
  ApiResponse.ok(res, 'Primary field set successfully', field);
});

const deleteField = asyncHandler(async (req, res) => {
  const field = await fieldService.deleteField(req.params.id, req.userId);
  ApiResponse.ok(res, 'Field deleted successfully', field);
});

module.exports = {
  createField,
  getUserFields,
  getField,
  updateField,
  setPrimaryField,
  deleteField,
};

