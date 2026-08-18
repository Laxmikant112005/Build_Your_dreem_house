const Joi = require('joi');

module.exports = {
  createProject: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    plotId: Joi.string().optional(),
    designId: Joi.string().optional(),
    blueprintId: Joi.string().optional(),
    engineerId: Joi.string().optional(),
    budget: Joi.object({
      estimated: Joi.number().min(0).optional(),
      current: Joi.number().min(0).optional(),
      currency: Joi.string().optional(),
    }).optional(),
    timeline: Joi.object({
      startDate: Joi.date().optional(),
      estimatedEndDate: Joi.date().optional(),
    }).optional(),
    construction: Joi.object({
      totalArea: Joi.number().min(0).optional(),
      floors: Joi.number().min(1).optional(),
      bedrooms: Joi.number().min(0).optional(),
      bathrooms: Joi.number().min(0).optional(),
    }).optional(),
  }).unknown(false),

  updateProject: Joi.object({
    name: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    budget: Joi.object({
      estimated: Joi.number().min(0).optional(),
      current: Joi.number().min(0).optional(),
    }).optional(),
    timeline: Joi.object({
      startDate: Joi.date().optional(),
      estimatedEndDate: Joi.date().optional(),
    }).optional(),
    construction: Joi.object({
      totalArea: Joi.number().min(0).optional(),
      floors: Joi.number().min(1).optional(),
      bedrooms: Joi.number().min(0).optional(),
      bathrooms: Joi.number().min(0).optional(),
    }).optional(),
  }).min(1).unknown(false),

  updateStatus: Joi.object({
    status: Joi.string().valid(
      'planning', 'design_approval', 'permit_pending',
      'construction_ready', 'under_construction', 'on_hold',
      'completed', 'cancelled'
    ).required(),
  }),

  addMilestone: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(500).allow('').optional(),
    dueDate: Joi.date().optional(),
    budgetAllocated: Joi.number().min(0).optional(),
  }),

  updateMilestone: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().max(500).allow('').optional(),
    dueDate: Joi.date().allow(null).optional(),
    completedDate: Joi.date().allow(null).optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'overdue').optional(),
    budgetAllocated: Joi.number().min(0).optional(),
    budgetSpent: Joi.number().min(0).optional(),
  }).min(1),

  updateStage: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'delayed').optional(),
    percentage: Joi.number().min(0).max(100).optional(),
    notes: Joi.string().max(1000).allow('').optional(),
    endDate: Joi.date().allow(null).optional(),
  }).min(1),

  addDocument: Joi.object({
    name: Joi.string().trim().min(1).required(),
    url: Joi.string().uri().required(),
    type: Joi.string().optional(),
    category: Joi.string().valid('land_record', 'legal', 'quotation', 'agreement', 'bill', 'receipt', 'other').optional(),
  }),

  inviteMember: Joi.object({
    userId: Joi.string().required(),
    role: Joi.string().valid('engineer', 'contractor', 'viewer').default('viewer'),
  }),
};

