/**
 * Planova - Construction Monitoring Controller
 */
const constructionService = require('./construction.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const initialize = asyncHandler(async (req, res) => {
  const c = await constructionService.initialize(req.userId, req.body.projectId, req.body);
  ApiResponse.created(res, 'Construction tracking initialized', c);
});

const getByProject = asyncHandler(async (req, res) => {
  const c = await constructionService.getByProject(req.params.projectId, req.userId);
  ApiResponse.ok(res, 'Construction data retrieved', c);
});

const updateStage = asyncHandler(async (req, res) => {
  const c = await constructionService.updateStage(req.params.projectId, req.userId, req.params.stageId, req.body);
  ApiResponse.ok(res, 'Stage updated', c);
});

const addMilestone = asyncHandler(async (req, res) => {
  const c = await constructionService.addMilestone(req.params.projectId, req.userId, req.body);
  ApiResponse.created(res, 'Milestone added', c);
});

const updateMilestone = asyncHandler(async (req, res) => {
  const c = await constructionService.updateMilestone(req.params.projectId, req.userId, req.params.milestoneId, req.body);
  ApiResponse.ok(res, 'Milestone updated', c);
});

const addDailyLog = asyncHandler(async (req, res) => {
  const c = await constructionService.addDailyLog(req.params.projectId, req.userId, req.body);
  ApiResponse.created(res, 'Daily log added', c);
});

const addPhotos = asyncHandler(async (req, res) => {
  const c = await constructionService.addPhotos(req.params.projectId, req.userId, req.body.stageId, req.body.photos);
  ApiResponse.ok(res, 'Photos added', c);
});

const addDelayAlert = asyncHandler(async (req, res) => {
  const c = await constructionService.addDelayAlert(req.params.projectId, req.userId, req.body);
  ApiResponse.created(res, 'Delay alert added', c);
});

const resolveAlert = asyncHandler(async (req, res) => {
  const c = await constructionService.resolveAlert(req.params.projectId, req.userId, req.params.alertId);
  ApiResponse.ok(res, 'Alert resolved', c);
});

const generateReport = asyncHandler(async (req, res) => {
  const c = await constructionService.generateReport(req.params.projectId, req.userId, req.body);
  ApiResponse.created(res, 'Report generated', c);
});

const getProgressSummary = asyncHandler(async (req, res) => {
  const s = await constructionService.getProgressSummary(req.userId);
  ApiResponse.ok(res, 'Progress summary retrieved', s);
});

module.exports = {
  initialize, getByProject, updateStage, addMilestone, updateMilestone,
  addDailyLog, addPhotos, addDelayAlert, resolveAlert, generateReport, getProgressSummary,
};

