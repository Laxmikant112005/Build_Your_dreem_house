const express = require('express');
const router = express.Router();
const cc = require('./construction.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validateJoi } = require('../../middleware/joi.middleware');
const cv = require('./construction.validator');

router.use(authenticate);

router.post('/initialize', validateJoi(cv.initialize, 'body'), cc.initialize);
router.get('/summary', cc.getProgressSummary);
router.get('/project/:projectId', cc.getByProject);
router.put('/project/:projectId/stages/:stageId', validateJoi(cv.updateStage, 'body'), cc.updateStage);
router.post('/project/:projectId/milestones', validateJoi(cv.addMilestone, 'body'), cc.addMilestone);
router.put('/project/:projectId/milestones/:milestoneId', validateJoi(cv.updateMilestone, 'body'), cc.updateMilestone);
router.post('/project/:projectId/daily-logs', validateJoi(cv.addDailyLog, 'body'), cc.addDailyLog);
router.post('/project/:projectId/photos', validateJoi(cv.addPhotos, 'body'), cc.addPhotos);
router.post('/project/:projectId/delay-alerts', validateJoi(cv.addDelayAlert, 'body'), cc.addDelayAlert);
router.put('/project/:projectId/delay-alerts/:alertId/resolve', cc.resolveAlert);
router.post('/project/:projectId/reports', validateJoi(cv.generateReport, 'body'), cc.generateReport);

module.exports = router;

