/**
 * Planova / BuildMyHome - API Routes
 * Main router configuration
 */

const express = require('express');
const config = require('../config');

const router = express.Router();

// Import route modules
const authRoutes = require('../modules/auth/auth.route');
const userRoutes = require('../modules/user/user.route');
const engineerRoutes = require('../modules/engineer/engineer.route');
const designRoutes = require('../modules/design/design.route');
const blueprintRoutes = require('../modules/blueprint/blueprint.route');
const bookingRoutes = require('../modules/booking/booking.route');
const appointmentRoutes = require('../modules/appointment/appointment.route');
const reviewRoutes = require('../modules/review/review.route');
const chatRoutes = require('../modules/chat/chat.route');
const materialRoutes = require('../modules/material/material.route');
const cartRoutes = require('../modules/cart/cart.route');
const orderRoutes = require('../modules/order/order.route');
const notificationRoutes = require('../modules/notification/notification.route');
const uploadRoutes = require('../modules/upload/upload.route');
const categoryRoutes = require('../modules/category/category.route');
const adminRoutes = require('../modules/admin/admin.route');
const recommendationRoutes = require('../modules/recommendation/recommendation.route');
const fieldRoutes = require('../modules/field/field.route');
const plotRoutes = require('../modules/plot/plot.route');
const collectionRoutes = require('../modules/collection/collection.route');
const followRoutes = require('../modules/follow/follow.route');
const recentlyViewedRoutes = require('../modules/recentlyViewed/recentlyViewed.route');
const budgetRoutes = require('../modules/budget/budget.route');
const documentRoutes = require('../modules/document/document.route');
const constructionRoutes = require('../modules/construction/construction.route');
const dashboardRoutes = require('../modules/dashboard/dashboard.route');
const projectRoutes = require('../modules/project/project.route');
const searchRoutes = require('../modules/search/search.route');

// Mount routes
// IMPORTANT: app.js mounts this router at `/api`, so these should NOT include the `/api` prefix.
router.use(`/${config.apiVersion}/fields`, fieldRoutes);
router.use(`/${config.apiVersion}/auth`, authRoutes);
router.use(`/${config.apiVersion}/users`, userRoutes);
router.use(`/${config.apiVersion}/engineers`, engineerRoutes);
router.use(`/${config.apiVersion}/designs`, designRoutes);
router.use(`/${config.apiVersion}/blueprints`, blueprintRoutes);
router.use(`/${config.apiVersion}/bookings`, bookingRoutes);
router.use(`/${config.apiVersion}/appointments`, appointmentRoutes);
router.use(`/${config.apiVersion}/reviews`, reviewRoutes);
router.use(`/${config.apiVersion}/chats`, chatRoutes);
router.use(`/${config.apiVersion}/notifications`, notificationRoutes);
router.use(`/${config.apiVersion}/materials`, materialRoutes);
router.use(`/${config.apiVersion}/carts`, cartRoutes);
router.use(`/${config.apiVersion}/orders`, orderRoutes);
router.use(`/${config.apiVersion}/uploads`, uploadRoutes);
router.use(`/${config.apiVersion}/categories`, categoryRoutes);
router.use(`/${config.apiVersion}/admin`, adminRoutes);
router.use(`/${config.apiVersion}/recommendations`, recommendationRoutes);
router.use(`/${config.apiVersion}/plots`, plotRoutes);
router.use(`/${config.apiVersion}/collections`, collectionRoutes);
router.use(`/${config.apiVersion}/follows`, followRoutes);
router.use(`/${config.apiVersion}/recently-viewed`, recentlyViewedRoutes);
router.use(`/${config.apiVersion}/budgets`, budgetRoutes);
router.use(`/${config.apiVersion}/documents`, documentRoutes);
router.use(`/${config.apiVersion}/construction`, constructionRoutes);
router.use(`/${config.apiVersion}/dashboard`, dashboardRoutes);
router.use(`/${config.apiVersion}/projects`, projectRoutes);
router.use(`/${config.apiVersion}/search`, searchRoutes);

// Health check
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

module.exports = router;

