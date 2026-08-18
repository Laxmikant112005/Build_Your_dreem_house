const Joi = require('joi');

module.exports = {
  createDocument: Joi.object({
    name: Joi.string().trim().max(200).required(),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid(
      'property_document', 'land_record', 'legal_document',
      'quotation', 'agreement', 'bill', 'receipt',
      'property_image', 'identification', 'contract',
      'permit', 'insurance', 'warranty', 'other'
    ).required(),
    folder: Joi.string().max(100).default('General'),
    file: Joi.object({
      url: Joi.string().uri().required(),
      thumbnailUrl: Joi.string().uri().allow(''),
      name: Joi.string().required(),
      originalName: Joi.string().allow(''),
      mimeType: Joi.string().required(),
      size: Joi.number().min(0).required(),
      format: Joi.string().allow(''),
    }).required(),
    tags: Joi.array().items(Joi.string().trim()).default([]),
    projectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
    propertyId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
    metadata: Joi.object({
      uploadedVia: Joi.string().valid('web', 'mobile', 'email'),
      documentDate: Joi.date(),
      documentNumber: Joi.string().allow(''),
      issuedBy: Joi.string().allow(''),
      amount: Joi.number(),
    }).default({}),
  }),

  updateDocument: Joi.object({
    name: Joi.string().trim().max(200),
    description: Joi.string().max(500).allow(''),
    category: Joi.string().valid(
      'property_document', 'land_record', 'legal_document',
      'quotation', 'agreement', 'bill', 'receipt',
      'property_image', 'identification', 'contract',
      'permit', 'insurance', 'warranty', 'other'
    ),
    folder: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().trim()),
    isFavorite: Joi.boolean(),
    isArchived: Joi.boolean(),
    metadata: Joi.object({
      documentDate: Joi.date(),
      documentNumber: Joi.string().allow(''),
      issuedBy: Joi.string().allow(''),
      amount: Joi.number(),
    }),
  }),

  createFolder: Joi.object({
    name: Joi.string().trim().max(100).required(),
  }),
};

