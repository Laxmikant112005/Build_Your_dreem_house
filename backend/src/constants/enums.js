/**
 * BuildMyHome / Planova - Enumerations
 * ConTech domain enums for Blueprint Marketplace, GeoSpatial plots,
 * Appointments, and AI metadata.
 */

module.exports = {
  // ===================================================================
  // USER / ENGINEER
  // ===================================================================
  USER_ROLES: ['user', 'engineer', 'admin'],

  VERIFICATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // ===================================================================
  // BLUEPRINT (replaces legacy Design)
  // ===================================================================
  BLUEPRINT_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
  },

  BLUEPRINT_ACCESS_TIER: {
    FREE: 'free',
    PREMIUM: 'premium',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
  },

  HOUSE_STYLES: [
    'modern',
    'traditional',
    'villa',
    'duplex',
    'contemporary',
    'minimalist',
    'colonial',
    'mediterranean',
    'industrial',
    'farmhouse',
    'cottage',
    'craftsman',
    'midcentury',
    'fusion',
  ],

  CONSTRUCTION_TYPES: ['RCC', 'Steel', 'Wood', 'Mixed', 'Prefab', 'ShippingContainer'],

  VASTU_ORIENTATION: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],

  KITCHEN_TYPE: ['open', 'closed', 'modular', 'island', 'l-shaped', 'u-shaped', 'galley'],

  PARKING_TYPE: ['covered', 'open', 'basement', 'carport', 'none'],

  SUSTAINABILITY_FEATURES: [
    'solar_panels',
    'rainwater_harvesting',
    'green_roof',
    'energy_efficient_windows',
    'natural_ventilation',
    'greywater_recycling',
    'vertical_garden',
    'smart_lighting',
    'solar_water_heater',
    'ev_charging',
    'geothermal_cooling',
    'passive_cooling',
    'low_voc_paint',
    'recycled_materials',
  ],

  // ===================================================================
  // PLOT (replaces legacy Field)
  // ===================================================================
  PLOT_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
  },

  TERRAIN_TYPE: [
    'flat',
    'sloped_gentle',
    'sloped_steep',
    'hilly',
    'rocky',
    'coastal',
    'floodplain',
    'corner',
    'trapezoidal',
    'irregular',
  ],

  SOIL_TYPE: [
    'alluvial',
    'black_cotton',
    'laterite',
    'sandy',
    'clay',
    'loamy',
    'rocky',
    'red',
    'murram',
    'filled',
  ],

  ROAD_ACCESS: ['front', 'rear', 'side', 'corner', 'cul_de_sac', 'no_access'],

  // ===================================================================
  // APPOINTMENT (replaces legacy Booking)
  // ===================================================================
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    RESCHEDULED: 'rescheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    NO_SHOW: 'no_show',
  },

  APPOINTMENT_TYPE: {
    DISCOVERY_CALL: 'discovery_call',
    SITE_AUDIT: 'site_audit',
    DESIGN_REVIEW: 'design_review',
    CONSULTATION: 'consultation',
    ESTIMATION: 'estimation',
    CONSTRUCTION_MEETING: 'construction_meeting',
    FINAL_WALKTHROUGH: 'final_walkthrough',
  },

  APPOINTMENT_MODE: {
    VIDEO: 'video',
    IN_PERSON: 'in_person',
    PHONE: 'phone',
  },

  // ===================================================================
  // BOOKING (legacy, kept for backward compatibility)
  // ===================================================================
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  },

  BOOKING_TYPE: {
    CONSULTATION: 'consultation',
    DESIGN: 'design',
    CONSTRUCTION: 'construction',
    RENOVATION: 'renovation',
  },

  MEETING_TYPE: {
    VIDEO: 'video',
    IN_PERSON: 'in-person',
    PHONE: 'phone',
  },

  // ===================================================================
  // DESIGN (legacy, kept for backward compatibility)
  // ===================================================================
  DESIGN_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // ===================================================================
  // FIELD (legacy, kept for backward compatibility)
  // ===================================================================
  FIELD_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
  },

  // ===================================================================
  // REVIEW
  // ===================================================================
  REVIEW_RATINGS: {
    MIN: 1,
    MAX: 5,
  },

  REVIEW_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged',
  },

  // ===================================================================
  // NOTIFICATION
  // ===================================================================
  NOTIFICATION_TYPES: {
    BOOKING: 'booking',
    MESSAGE: 'message',
    REVIEW: 'review',
    SYSTEM: 'system',
    DESIGN: 'design',
    PROMOTION: 'promotion',
    APPOINTMENT: 'appointment',
    PLOT: 'plot',
    COLLECTION: 'collection',
  },

  NOTIFICATION_PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  NOTIFICATION_SOURCES: {
    SYSTEM: 'system',
    BOOKING: 'booking',
    CHAT: 'chat',
    REVIEW: 'review',
    DESIGN: 'design',
    ADMIN: 'admin',
    PROMOTION: 'promotion',
  },

  // ===================================================================
  // CHAT
  // ===================================================================
  CHAT_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group',
    BOOKING: 'booking',
    PROJECT: 'project',
  },

  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    SYSTEM: 'system',
    APPOINTMENT_LINK: 'appointment_link',
  },

  // ===================================================================
  // FILE CATEGORIES
  // ===================================================================
  FILE_CATEGORIES: {
    IMAGE: 'image',
    FLOOR_PLAN: 'floorPlan',
    CAD_FILE: 'cadFile',
    MODEL_3D: 'model3d',
    DOCUMENT: 'document',
    BLUEPRINT: 'blueprint',
  },

  // ===================================================================
  // MARKETPLACE (Materials, Orders)
  // ===================================================================
  MATERIAL_CATEGORIES: [
    'cement',
    'steel',
    'tiles',
    'paint',
    'sand',
    'aggregate',
    'bricks',
    'windows',
    'doors',
    'kitchen',
    'bathroom',
    'electrical',
    'plumbing',
    'solar',
    'slabs',
    'roofing',
    'flooring',
    'landscaping',
  ],

  MATERIAL_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
  },

  PAYMENT_GATEWAYS: ['stripe', 'razorpay'],
  PAYMENT_STATUS: ['pending', 'paid', 'failed', 'refunded'],
  DELIVERY_STATUS: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
  ORDER_STATUS: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],

  // ===================================================================
  // COMPARISON & COLLECTIONS
  // ===================================================================
  COLLECTION_VISIBILITY: {
    PRIVATE: 'private',
    PUBLIC: 'public',
    SHARED: 'shared',
  },

  COMPARISON_MAX_ITEMS: 4,

  // ===================================================================
  // AI & ML
  // ===================================================================
  AI_PROVIDERS: {
    OPENAI: 'openai',
    PINECONE: 'pinecone',
    CHROMA: 'chroma',
    LANGCHAIN: 'langchain',
    HUGGINGFACE: 'huggingface',
    VERTEX_AI: 'vertex_ai',
    CUSTOM: 'custom',
  },
};

