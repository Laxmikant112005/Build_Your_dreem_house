// Engineer module Joi validators
const Joi = require('joi');

const licenseFileSchema = Joi.object({
  url: Joi.string().uri().allow('').optional(),
  name: Joi.string().max(200).optional(),
  uploadedAt: Joi.date().optional(),
}).optional();

const educationSchema = Joi.object({
  degree: Joi.string().max(200).optional(),
  institution: Joi.string().max(200).optional(),
  year: Joi.number().integer().min(1900).max(2200).optional(),
});

const certificationSchema = Joi.object({
  name: Joi.string().max(200).optional(),
  issuer: Joi.string().max(200).optional(),
  year: Joi.number().integer().min(1900).max(2200).optional(),
  credentialUrl: Joi.string().uri().allow('').optional(),
});

// Professional profile update
const updateProfile = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).allow('').optional(),
  avatar: Joi.string().uri().allow('').optional(),
  engineerProfile: Joi.object({
    bio: Joi.string().max(2000).allow('').optional(),
    title: Joi.string().max(100).allow('').optional(),
    company: Joi.string().max(100).allow('').optional(),
    licenseNumber: Joi.string().max(100).optional(),
    specialization: Joi.string().max(100).optional(),
    experienceYears: Joi.number().min(0).max(100).optional(),
    certificates: Joi.array().items(certificationSchema).optional(),
    portfolioMedia: Joi.array().items(Joi.string().uri()).optional(),
    availabilityStatus: Joi.string().valid('AVAILABLE', 'BUSY', 'ON_LEAVE').optional(),
    licenseFile: licenseFileSchema,
    yearsOfExperience: Joi.number().min(0).max(100).optional(),
    specializations: Joi.array().items(Joi.string().max(100)).optional(),
    hourlyRate: Joi.number().min(0).optional(),
    projectRate: Joi.number().min(0).optional(),
    currency: Joi.string().max(10).optional(),
    serviceAreas: Joi.array().items(
      Joi.object({
        location: Joi.object({
          type: Joi.string().valid('Point').default('Point'),
          coordinates: Joi.array().items(Joi.number()).length(2).optional(),
        }).optional(),
        lng: Joi.number().optional(),
        lat: Joi.number().optional(),
        radiusKm: Joi.number().min(0).optional(),
        radius: Joi.number().min(0).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
      })
    ).optional(),
    education: Joi.array().items(educationSchema).optional(),
    certifications: Joi.array().items(certificationSchema).optional(),
    portfolio: Joi.array().items(
      Joi.object({
        title: Joi.string().max(200).optional(),
        description: Joi.string().max(2000).optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
        blueprintId: Joi.string().optional(),
        completedDate: Joi.date().optional(),
        clientName: Joi.string().max(100).optional(),
        projectUrl: Joi.string().uri().allow('').optional(),
      })
    ).optional(),
  }).optional(),
}).min(1);

// Availability weekly slots
const updateAvailability = Joi.object({
  availability: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    })
  ).required(),
});

// Availability slots (calendar overrides)
const updateAvailabilitySlots = Joi.object({
  availabilitySlots: Joi.array().items(
    Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required(),
      note: Joi.string().max(500).optional(),
      isBooked: Joi.boolean().optional(),
    })
  ).optional(),
});

// Portfolio add
const addPortfolio = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  blueprintId: Joi.string().optional(),
  completedDate: Joi.date().optional(),
  clientName: Joi.string().max(100).optional(),
  projectUrl: Joi.string().uri().allow('').optional(),
});

// Verification submission
const submitVerification = Joi.object({
  licenseNumber: Joi.string().max(100).optional(),
  licenseFile: licenseFileSchema,
  yearsOfExperience: Joi.number().min(0).max(100).optional(),
  education: Joi.array().items(educationSchema).optional(),
  certifications: Joi.array().items(certificationSchema).optional(),
}).min(1);

// Backward compatible aliases used by routes
const createProfile = updateProfile;
const availability = updateAvailability;
const portfolio = addPortfolio;

module.exports = {
  createProfile,
  updateProfile,
  availability,
  updateAvailability,
  updateAvailabilitySlots,
  addPortfolio,
  portfolio,
  submitVerification,
};

