const Joi = require('joi');

module.exports = {
  initialize: Joi.object({
    startDate: Joi.date(),
    estimatedEndDate: Joi.date().greater(Joi.ref('startDate')),
    stages: Joi.array().items(Joi.object({
      name: Joi.string().max(200).required(),
      order: Joi.number().required(),
      description: Joi.string().max(1000),
    })),
  }),

  updateStage: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'delayed'),
    progressPercent: Joi.number().min(0).max(100),
    startDate: Joi.date(),
    endDate: Joi.date(),
    actualEndDate: Joi.date(),
    notes: Joi.string().max(1000),
  }),

  addMilestone: Joi.object({
    name: Joi.string().max(200).required(),
    stageIndex: Joi.number(),
    description: Joi.string().max(500),
    targetDate: Joi.date(),
  }),

  updateMilestone: Joi.object({
    name: Joi.string().max(200),
    status: Joi.string().valid('pending', 'completed', 'overdue'),
    targetDate: Joi.date(),
    notes: Joi.string().max(500),
  }),

  addDailyLog: Joi.object({
    date: Joi.date().default(Date.now),
    weather: Joi.string(),
    temperature: Joi.string(),
    workersPresent: Joi.number().min(0),
    hoursWorked: Joi.number().min(0),
    description: Joi.string().max(2000).required(),
    photos: Joi.array().items(Joi.object({
      url: Joi.string().uri(),
      caption: Joi.string(),
    })),
    notes: Joi.string().max(1000),
  }),

  addDelayAlert: Joi.object({
    message: Joi.string().max(500).required(),
    severity: Joi.string().valid('info', 'warning', 'critical').default('warning'),
  }),

  generateReport: Joi.object({
    title: Joi.string().max(200),
    type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').default('weekly'),
    period: Joi.object({ start: Joi.date(), end: Joi.date() }),
    summary: Joi.string().max(3000),
  }),

  addPhotos: Joi.object({
    stageId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
    photos: Joi.array().items(Joi.object({
      url: Joi.string().uri().required(),
      caption: Joi.string().max(200),
    })).min(1).required(),
  }),
};

