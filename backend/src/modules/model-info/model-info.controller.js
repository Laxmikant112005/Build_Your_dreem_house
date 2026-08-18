/**
 * AntiGravity - Model Info Controller
 */

const ModelSpec = require('./model-spec.model');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/**
 * Get Gemini Flash model specifications
 */
const getModelSpecs = catchAsync(async (req, res) => {
  const specs = await ModelSpec.findOne({ name: 'Gemini Flash' });
  
  if (!specs) {
    // Return default or empty if not found
    return res.status(200).json(new ApiResponse(200, {}, 'No model specifications found'));
  }
  
  res.status(200).json(new ApiResponse(200, specs, 'Model specifications fetched'));
});

/**
 * Update model specifications
 */
const updateModelSpecs = catchAsync(async (req, res) => {
  const { specifications, benefits, useCases, technicalMetadata, version } = req.body;
  
  const specs = await ModelSpec.findOneAndUpdate(
    { name: 'Gemini Flash' },
    {
      specifications,
      benefits,
      useCases,
      technicalMetadata,
      version,
    },
    { new: true, upsert: true, runValidators: true }
  );
  
  res.status(200).json(new ApiResponse(200, specs, 'Model specifications updated'));
});

module.exports = {
  getModelSpecs,
  updateModelSpecs,
};
