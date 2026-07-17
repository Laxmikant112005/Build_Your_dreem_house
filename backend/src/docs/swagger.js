/**
 * BuildMyHome - Swagger Configuration
 * API documentation for BuildMyHome platform
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuildMyHome API',
      version: '1.0.0',
      description: 'Backend API documentation for BuildMyHome platform - A platform connecting users with architects and engineers for building their dream homes.',
      contact: {
        name: 'API Support',
        email: 'support@buildmyhome.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'BuildMyHome API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (accessToken) from /auth/login response',
        },
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            meta: {
              type: 'object',
              description: 'Pagination or additional metadata',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errorCode: {
              type: 'string',
              example: 'VALIDATION_ERROR',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        // Auth schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (min 6 characters)',
              example: 'password123',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1234567890',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
              example: 'password123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user123' },
                email: { type: 'string', example: 'john@example.com' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'user' },
              },
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        // Booking schemas
        CreateBookingRequest: {
          type: 'object',
          required: ['engineerId', 'date', 'time', 'projectType'],
          properties: {
            engineerId: {
              type: 'string',
              description: 'ID of the engineer to book',
              example: 'engineer123',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Booking date (YYYY-MM-DD)',
              example: '2024-12-25',
            },
            time: {
              type: 'string',
              description: 'Booking time (HH:MM)',
              example: '10:00',
            },
            projectType: {
              type: 'string',
              description: 'Type of project',
              example: 'residential',
            },
            description: {
              type: 'string',
              description: 'Project description',
              example: 'I want to build a 2-story house',
            },
            budget: {
              type: 'number',
              description: 'Project budget',
              example: 50000,
            },
          },
        },
        UpdateBookingRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled', 'completed'],
              description: 'Booking status',
              example: 'confirmed',
            },
            meetingLink: {
              type: 'string',
              description: 'Meeting link for video call',
              example: 'https://meet.google.com/abc-defg-hij',
            },
            reason: {
              type: 'string',
              description: 'Reason for cancellation',
              example: 'Schedule conflict',
            },
          },
        },
        // User schemas
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1234567890',
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL',
              example: 'https://cdn.example.com/avatars/user123.jpg',
            },
          },
        },
        // Design schemas
        CreateDesignRequest: {
          type: 'object',
          required: ['title', 'description', 'style', 'cost', 'area', 'floors'],
          properties: {
            title: {
              type: 'string',
              description: 'Design title',
              example: 'Modern Villa Design',
            },
            description: {
              type: 'string',
              description: 'Design description',
              example: 'A beautiful modern villa with open floor plan',
            },
            style: {
              type: 'string',
              description: 'Architectural style',
              example: 'modern',
            },
            cost: {
              type: 'number',
              description: 'Estimated cost',
              example: 75000,
            },
            area: {
              type: 'number',
              description: 'Total area in sq ft',
              example: 2500,
            },
            floors: {
              type: 'integer',
              description: 'Number of floors',
              example: 2,
            },
            city: {
              type: 'string',
              description: 'City location',
              example: 'New York',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of image URLs',
              example: ['https://cdn.example.com/images/design1.jpg'],
            },
          },
        },
        DesignQueryParams: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              default: 1,
              description: 'Page number',
            },
            limit: {
              type: 'integer',
              default: 20,
              description: 'Items per page',
            },
            search: {
              type: 'string',
              description: 'Search keyword',
            },
            style: {
              type: 'string',
              description: 'Filter by style',
            },
            minCost: {
              type: 'number',
              description: 'Minimum cost',
            },
            maxCost: {
              type: 'number',
              description: 'Maximum cost',
            },
            sortBy: {
              type: 'string',
              default: 'createdAt',
              description: 'Sort field',
            },
            sortOrder: {
              type: 'string',
              default: 'desc',
              enum: ['asc', 'desc'],
              description: 'Sort order',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User profile and management',
      },
      {
        name: 'Bookings',
        description: 'Booking management',
      },
      {
        name: 'Designs',
        description: 'Design listings and management',
      },
      {
        name: 'Engineers',
        description: 'Engineer profiles and listings',
      },
      {
        name: 'Categories',
        description: 'Design categories',
      },
      {
        name: 'Reviews',
        description: 'Review and rating system',
      },
      {
        name: 'Chat',
        description: 'Messaging and chat',
      },
      {
        name: 'Notifications',
        description: 'User notifications',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/swagger.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// ==================== API Endpoints Documentation ====================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account and returns authentication tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticates user and returns JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     description: Creates a new booking with an engineer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [Bookings]
 *     summary: Get user's bookings
 *     description: Retrieves paginated list of user's bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bookings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 50
 */

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking
 *     description: Updates a booking (confirm, cancel, complete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingRequest'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking confirmed successfully
 *                 data:
 *                   type: object
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /designs:
 *   post:
 *     tags: [Designs]
 *     summary: Create a new design
 *     description: Creates a new house design (engineer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDesignRequest'
 *     responses:
 *       201:
 *         description: Design created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Design created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [Designs]
 *     summary: Get all designs
 *     description: Retrieves paginated list of designs with optional filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: style
 *         schema:
 *           type: string
 *       - in: query
 *         name: minCost
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxCost
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Designs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Designs retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 */

module.exports = {
  swaggerUi,
  swaggerSpec,
};

