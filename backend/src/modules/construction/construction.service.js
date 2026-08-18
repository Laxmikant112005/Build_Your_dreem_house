/**
 * Planova - Construction Monitoring Service
 */
const mongoose = require('mongoose');
const Construction = require('./construction.model');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notification/notification.service');
const { NOTIFICATION_TYPES } = require('../../constants/enums');

class ConstructionService {
  async initialize(userId, projectId, data = {}) {
    const existing = await Construction.findOne({ projectId });
    if (existing) throw new ApiError(409, 'Construction tracking already exists for this project');

    const stages = data.stages || [
      { name: 'Site Preparation', order: 1, status: 'pending', description: 'Site clearing, surveying, marking' },
      { name: 'Foundation', order: 2, status: 'pending', description: 'Excavation, footing, foundation walls, damp proofing' },
      { name: 'Superstructure', order: 3, status: 'pending', description: 'Columns, beams, slabs, walls' },
      { name: 'Roofing', order: 4, status: 'pending', description: 'Roof structure, waterproofing, insulation' },
      { name: 'MEP Work', order: 5, status: 'pending', description: 'Electrical, plumbing, HVAC installations' },
      { name: 'Finishing', order: 6, status: 'pending', description: 'Plastering, flooring, painting, fixtures' },
      { name: 'Exterior Work', order: 7, status: 'pending', description: 'Landscaping, driveway, fencing, drainage' },
      { name: 'Handover', order: 8, status: 'pending', description: 'Final inspection, documentation, handover' },
    ];

    const construction = await Construction.create({
      userId, projectId,
      startDate: data.startDate,
      estimatedEndDate: data.estimatedEndDate,
      stages,
      status: 'not_started',
    });

    return construction;
  }

  async getByProject(projectId, userId) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction tracking not found for this project');
    return c;
  }

  async updateStage(projectId, userId, stageId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');

    const stage = c.stages.id(stageId);
    if (!stage) throw new ApiError(404, 'Stage not found');

    if (data.status) stage.status = data.status;
    if (data.progressPercent !== undefined) stage.progressPercent = data.progressPercent;
    if (data.startDate) stage.startDate = data.startDate;
    if (data.endDate) stage.endDate = data.endDate;
    if (data.actualEndDate) stage.actualEndDate = data.actualEndDate;
    if (data.notes) stage.notes = data.notes;

    if (data.status === 'completed') {
      stage.progressPercent = 100;
      stage.actualEndDate = stage.actualEndDate || new Date();
    }

    await c.save();

    // Check for delay alerts
    if (stage.status === 'delayed') {
      c.delayAlerts.push({
        message: `Stage "${stage.name}" is delayed.`,
        severity: 'warning',
      });
      await c.save();
    }

    return c;
  }

  async addMilestone(projectId, userId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    c.milestones.push(data);
    await c.save();
    return c;
  }

  async updateMilestone(projectId, userId, milestoneId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    const m = c.milestones.id(milestoneId);
    if (!m) throw new ApiError(404, 'Milestone not found');
    Object.assign(m, data);
    if (data.status === 'completed') m.completedDate = new Date();
    await c.save();
    return c;
  }

  async addDailyLog(projectId, userId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    c.dailyLogs.push({ ...data, createdBy: userId });
    await c.save();
    return c;
  }

  async addPhotos(projectId, userId, stageId, photos) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    if (stageId) {
      const stage = c.stages.id(stageId);
      if (stage) stage.photos.push(...photos);
    } else {
      // Add to daily log
      if (c.dailyLogs.length > 0) {
        c.dailyLogs[c.dailyLogs.length - 1].photos.push(...photos);
      }
    }
    await c.save();
    return c;
  }

  async addDelayAlert(projectId, userId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    c.delayAlerts.push({ ...data, date: new Date() });
    await c.save();

    // Send notification for critical delays
    if (data.severity === 'critical') {
      try {
        await notificationService.createNotification(
          userId, NOTIFICATION_TYPES.SYSTEM,
          'Critical Delay Alert', data.message,
          { projectId, type: 'delay' }
        );
      } catch (e) { /* ignore */ }
    }
    return c;
  }

  async resolveAlert(projectId, userId, alertId) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');
    const alert = c.delayAlerts.id(alertId);
    if (!alert) throw new ApiError(404, 'Alert not found');
    alert.resolved = true;
    alert.resolvedAt = new Date();
    await c.save();
    return c;
  }

  async generateReport(projectId, userId, data) {
    const c = await Construction.findOne({ projectId, userId });
    if (!c) throw new ApiError(404, 'Construction not found');

    const report = {
      title: data.title || `Progress Report - ${new Date().toLocaleDateString()}`,
      type: data.type || 'weekly',
      period: data.period || { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
      summary: data.summary || `Overall progress: ${c.overallProgress}%`,
      metrics: {
        progressAchieved: c.overallProgress,
        delays: c.delayAlerts.filter(a => !a.resolved).length,
        issuesReported: c.delayAlerts.length,
      },
    };

    c.reports.push(report);
    await c.save();
    return c;
  }

  async getProgressSummary(userId) {
    const projects = await Construction.find({ userId });
    return {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      delayed: projects.filter(p => p.status === 'delayed' || p.delayAlerts.some(a => !a.resolved)).length,
      averageProgress: projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.overallProgress, 0) / projects.length) : 0,
    };
  }
}

module.exports = new ConstructionService();

