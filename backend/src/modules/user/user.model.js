/**
 * BuildMyHome / Planova - User Model
 * Mongoose schema for users, engineers, preferences, collections and AI metadata.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { ROLE } = require('../../config/roles');
const {
  VERIFICATION_STATUS,
  AI_PROVIDERS,
} = require('../../config/enums');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },

    avatar: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    preferences: {
      budgetMin: {
        type: Number,
        default: 0,
        min: 0,
      },

      budgetMax: {
        type: Number,
        default: 0,
        min: 0,
      },

      preferredStyles: [
        {
          type: String,
        },
      ],

      preferredLocations: [
        {
          type: String,
        },
      ],

      landSize: {
        type: Number,
        min: 0,
      },

      desiredRooms: {
        type: Number,
        min: 0,
      },

      familySize: {
        type: Number,
        min: 0,
      },

      climateRegion: {
        type: String,
        enum: [
          'tropical',
          'temperate',
          'arid',
          'coastal',
          'mountain',
          'continental',
          null,
        ],
      },

      lifestylePreferences: [
        {
          type: String,
          enum: [
            'eco_friendly',
            'smart_home',
            'low_maintenance',
            'luxury',
            'compact',
            'wheelchair_accessible',
          ],
        },
      ],
    },

    engineerProfile: {
      bio: {
        type: String,
        maxlength: 2000,
      },

      title: {
        type: String,
        maxlength: 100,
      },

      company: {
        type: String,
        maxlength: 100,
      },

      isVerified: {
        type: Boolean,
        default: false,
      },

      verificationStatus: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.PENDING,
      },

      rejectionReason: {
        type: String,
      },

      licenseNumber: {
        type: String,
      },

      yearsOfExperience: {
        type: Number,
        default: 0,
        min: 0,
      },

      specializations: [
        {
          type: String,
        },
      ],

      hourlyRate: {
        type: Number,
        min: 0,
      },

      projectRate: {
        type: Number,
        min: 0,
      },

      currency: {
        type: String,
        default: 'INR',
      },

      serviceAreas: [
        {
          location: {
            type: {
              type: String,
              enum: ['Point'],
              default: 'Point',
            },

            coordinates: {
              type: [Number],
            },
          },

          radiusKm: {
            type: Number,
            min: 0,
          },

          city: String,
          state: String,
        },
      ],

      availability: [
        {
          dayOfWeek: {
            type: Number,
            min: 0,
            max: 6,
          },

          startTime: String,
          endTime: String,
        },
      ],

      availabilitySlots: [
        {
          start: Date,
          end: Date,
          note: String,
          isBooked: {
            type: Boolean,
            default: false,
          },
        },
      ],

      licenseFile: {
        url: String,
        name: String,
        uploadedAt: Date,
      },

      portfolio: [
        {
          title: {
            type: String,
            maxlength: 200,
          },

          description: {
            type: String,
            maxlength: 2000,
          },

          images: [String],

          blueprintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blueprint',
          },

          completedDate: Date,

          clientName: {
            type: String,
            maxlength: 100,
          },

          projectUrl: String,
        },
      ],

      education: [
        {
          degree: String,
          institution: String,
          year: Number,
        },
      ],

      certifications: [
        {
          name: String,
          issuer: String,
          year: Number,
          credentialUrl: String,
        },
      ],

      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },

        count: {
          type: Number,
          default: 0,
          min: 0,
        },
      },

      aiMetadata: {
        skillMatchScore: {
          type: Number,
          min: 0,
          max: 1,
        },

        demandScore: {
          type: Number,
          min: 0,
          max: 1,
        },

        responseRate: {
          type: Number,
          min: 0,
          max: 1,
        },

        completionRate: {
          type: Number,
          min: 0,
          max: 1,
        },

        avgResponseTime: {
          type: Number,
        },

        lastAnalyzedAt: {
          type: Date,
        },
      },
    },

    collections: [
      {
        name: {
          type: String,
          required: true,
          maxlength: 100,
        },

        description: {
          type: String,
          maxlength: 500,
        },

        visibility: {
          type: String,
          enum: ['private', 'public', 'shared'],
          default: 'private',
        },

        blueprintIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blueprint',
          },
        ],

        engineerIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],

        materialIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material',
          },
        ],

        createdAt: {
          type: Date,
          default: Date.now,
        },

        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    refreshToken: {
      type: String,
      select: false,
    },

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    lastLoginAt: Date,

    aiMetadata: {
      userSegment: String,

      engagementScore: {
        type: Number,
        min: 0,
        max: 1,
      },

      churnRisk: {
        type: Number,
        min: 0,
        max: 1,
      },

      lifetimeValue: Number,

      preferredCategories: [String],

      searchIntentHistory: [
        {
          query: String,
          timestamp: Date,
          resultClicked: {
            type: mongoose.Schema.Types.ObjectId,
          },
        },
      ],

      lastProcessedAt: Date,

      plotRecommendationProfile: {
        preferredMinArea: Number,
        preferredMaxArea: Number,
        preferredTerrain: [String],
        preferredSoilType: [String],
        lastUpdated: Date,
      },
    },

    vectorEmbeddingsRef: {
      provider: {
        type: String,
        enum: Object.values(AI_PROVIDERS),
      },

      embeddingId: String,
      lastSyncedAt: Date,
    },

    costPredictions: {
      averageProjectCost: Number,
      predictedBudgetRequired: Number,

      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },

      lastCalculatedAt: Date,

      factors: [
        {
          name: String,
          weight: Number,
          value: mongoose.Schema.Types.Mixed,
        },
      ],
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,

      transform: (doc, ret) => {
        ret.id = ret._id?.toString();

        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;

        return ret;
      },
    },
  }
);

/* Indexes */

userSchema.index({ createdAt: -1 });
userSchema.index({ 'engineerProfile.serviceAreas.location': '2dsphere' });
userSchema.index({ 'engineerProfile.verificationStatus': 1 });
userSchema.index({ 'engineerProfile.isVerified': 1 });
userSchema.index({ 'engineerProfile.specializations': 1 });
userSchema.index({ languages: 1 });

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({
  role: 1,
  'engineerProfile.rating.average': -1,
});
userSchema.index({
  role: 1,
  'engineerProfile.isVerified': 1,
  'engineerProfile.rating.average': -1,
});
userSchema.index({
  role: 1,
  'engineerProfile.yearsOfExperience': -1,
});
userSchema.index({
  role: 1,
  'engineerProfile.hourlyRate': 1,
});

userSchema.index({
  'engineerProfile.verificationStatus': 1,
  createdAt: 1,
});

userSchema.index({
  'preferences.budgetMax': 1,
  'preferences.preferredStyles': 1,
});

userSchema.index({
  'collections.visibility': 1,
});

userSchema.index({
  'collections.blueprintIds': 1,
});

userSchema.index({
  'aiMetadata.userSegment': 1,
});

userSchema.index({
  'aiMetadata.engagementScore': -1,
});

userSchema.index({
  'aiMetadata.churnRisk': -1,
});

userSchema.index({
  'engineerProfile.aiMetadata.skillMatchScore': -1,
});

userSchema.index({
  'engineerProfile.aiMetadata.demandScore': -1,
});

userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  'engineerProfile.bio': 'text',
});

/* Virtual */

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/* Password hashing */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/* Password comparison */

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

/* Role helpers */

userSchema.methods.isEngineer = function () {
  return this.role === ROLE.ENGINEER;
};

userSchema.methods.isAdmin = function () {
  return this.role === ROLE.ADMIN;
};

/* Collection helpers */

userSchema.methods.addToCollection = async function (
  collectionName,
  itemType,
  itemId
) {
  const collection = this.collections.find(
    (collection) => collection.name === collectionName
  );

  if (!collection) {
    throw new Error(`Collection "${collectionName}" not found`);
  }

  const fieldMap = {
    blueprint: 'blueprintIds',
    engineer: 'engineerIds',
    material: 'materialIds',
  };

  const field = fieldMap[itemType];

  if (!field) {
    throw new Error(`Invalid item type: ${itemType}`);
  }

  const exists = collection[field].some(
    (id) => id.toString() === itemId.toString()
  );

  if (!exists) {
    collection[field].push(itemId);
    collection.updatedAt = new Date();
    await this.save();
  }

  return collection;
};

userSchema.methods.removeFromCollection = async function (
  collectionName,
  itemType,
  itemId
) {
  const collection = this.collections.find(
    (collection) => collection.name === collectionName
  );

  if (!collection) {
    throw new Error(`Collection "${collectionName}" not found`);
  }

  const fieldMap = {
    blueprint: 'blueprintIds',
    engineer: 'engineerIds',
    material: 'materialIds',
  };

  const field = fieldMap[itemType];

  if (!field) {
    throw new Error(`Invalid item type: ${itemType}`);
  }

  collection[field] = collection[field].filter(
    (id) => id.toString() !== itemId.toString()
  );

  collection.updatedAt = new Date();
  await this.save();

  return collection;
};

const User = mongoose.model('User', userSchema);

module.exports = User;