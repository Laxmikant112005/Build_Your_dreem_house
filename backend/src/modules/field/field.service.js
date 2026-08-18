/**
 * Field Service - Business logic for field mapping
 */

const ApiError = require('../../utils/ApiError');
const Field = require('./field.model');
const logger = require('../../utils/logger');

const fieldService = {
  async createField(userId, fieldData) {
    const field = await Field.create({
      ...fieldData,
      userId,
    });
    logger.info(`Field created for user ${userId}: ${field.id}`);
    return field.populate('userId', 'firstName lastName');
  },

  async getUserFields(userId, options = {}) {
    const fields = await Field.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(options.limit || 10)
      .populate('userId', 'firstName lastName');
    return fields;
  },

  async getFieldById(fieldId) {
    const field = await Field.findById(fieldId).populate('userId', 'firstName lastName');
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }
    return field;
  },

  async updateField(fieldId, updateData) {
    const field = await Field.findByIdAndUpdate(
      fieldId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName');

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }
    
    logger.info(`Field ${fieldId} updated by user ${field.userId}`);
    return field;
  },

  async setPrimaryField(userId, fieldId) {
    // Reset all primary
    await Field.updateMany({ userId, isPrimary: true }, { isPrimary: false });
    // Set new
    const field = await Field.findOneAndUpdate(
      { _id: fieldId, userId },
      { isPrimary: true },
      { new: true }
    ).populate('userId', 'firstName lastName');

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }
    return field;
  },

  async deleteField(fieldId, userId) {
    const field = await Field.findOneAndUpdate(
      { _id: fieldId, userId },
      { status: 'deleted' },
      { new: true }
    );
    
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }
    return field;
  },
};

module.exports = fieldService;

