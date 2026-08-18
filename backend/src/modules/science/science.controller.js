/**
 * AntiGravity - Science Controller
 */

const ScientificContent = require('./scientific-content.model');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/**
 * Get all science modules
 */
const getScienceModules = catchAsync(async (req, res) => {
  const modules = await ScientificContent.find().select('topic description');
  res.status(200).json(new ApiResponse(200, modules, 'Science modules fetched'));
});

/**
 * Get specific science module by topic
 */
const getScienceModule = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const module = await ScientificContent.findOne({ topic: topicId });
  
  if (!module) {
    throw new ApiError(404, 'Science module not found');
  }
  
  res.status(200).json(new ApiResponse(200, module, 'Science module details fetched'));
});

/**
 * Create or update science module
 */
const upsertScienceModule = catchAsync(async (req, res) => {
  const { topic, equations, description, sections, visualReferences } = req.body;
  
  const module = await ScientificContent.findOneAndUpdate(
    { topic },
    {
      topic,
      equations,
      description,
      sections,
      visualReferences,
      createdBy: req.user.id,
    },
    { new: true, upsert: true, runValidators: true }
  );
  
  res.status(200).json(new ApiResponse(200, module, 'Science module saved successfully'));
});

module.exports = {
  getScienceModules,
  getScienceModule,
  upsertScienceModule,
};
