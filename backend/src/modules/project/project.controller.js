/**
 * Planova - Project Controller
 * Request handlers for construction project management
 */

const projectService = require('./project.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Create new project
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.userId, req.body);
  ApiResponse.created(res, 'Project created successfully', project);
});

/**
 * Get user's projects
 */
const getUserProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await projectService.getUserProjects(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.paginated(res, 'Projects retrieved successfully', result.projects, result.pagination);
});

/**
 * Get projects assigned to the authenticated engineer
 */
const getAssignedProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await projectService.getAssignedProjects(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.paginated(res, 'Assigned projects retrieved successfully', result.projects, result.pagination);
});

/**
 * Load the project and verify the current user is authorized
 * (owner, assigned engineer, or project member). Admin always allowed.
 */
const assertProjectAccess = async (projectId, userId, userRole) => {
  const project = await projectService.getProjectById(projectId);
  const allowed = await projectService.canAccessProject(project, userId, userRole);
  if (!allowed) {
    throw new ApiError(403, 'Access denied. You are not authorized to access this project.');
  }
  return project;
};

/**
 * Get project by ID
 */
const getProjectById = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.getProjectById(req.params.id);
  ApiResponse.ok(res, 'Project retrieved successfully', project);
});

/**
 * Update project (owner OR assigned engineer/member)
 */
const updateProject = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.updateProjectForMember(req.params.id, req.userId, req.body);
  ApiResponse.ok(res, 'Project updated successfully', project);
});

/**
 * Update project status
 */
const updateProjectStatus = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const { status } = req.body;
  const project = await projectService.updateStatus(req.params.id, req.userId, status);
  ApiResponse.ok(res, 'Project status updated successfully', project);
});

/**
 * Delete project (soft delete)
 */
const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.userId);
  ApiResponse.ok(res, 'Project deleted successfully');
});

/**
 * Add milestone
 */
const addMilestone = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.addMilestone(req.params.id, req.userId, req.body);
  ApiResponse.created(res, 'Milestone added successfully', project);
});

/**
 * Update milestone
 */
const updateMilestone = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.updateMilestoneForMember(req.params.id, req.userId, req.params.milestoneId, req.body);
  ApiResponse.ok(res, 'Milestone updated successfully', project);
});

/**
 * Update progress stage
 */
const updateStage = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const { stageIndex } = req.params;
  const project = await projectService.updateStageForMember(req.params.id, req.userId, parseInt(stageIndex), req.body);
  ApiResponse.ok(res, 'Stage updated successfully', project);
});

/**
 * Add document
 */
const addDocument = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.addDocumentForMember(req.params.id, req.userId, req.body);
  ApiResponse.created(res, 'Document added successfully', project);
});

/**
 * Remove document
 */
const removeDocument = asyncHandler(async (req, res) => {
  await assertProjectAccess(req.params.id, req.userId, req.user?.role);
  const project = await projectService.removeDocumentForMember(req.params.id, req.userId, req.params.documentId);
  ApiResponse.ok(res, 'Document removed successfully', project);
});

/**
 * Invite member
 */
const inviteMember = asyncHandler(async (req, res) => {
  const { userId: inviteUserId, role } = req.body;
  const project = await projectService.inviteMemberForMember(req.params.id, req.userId, inviteUserId, role);
  ApiResponse.ok(res, 'Member invited successfully', project);
});

/**
 * Remove member
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMemberForMember(req.params.id, req.userId, req.params.memberId);
  ApiResponse.ok(res, 'Member removed successfully', project);
});

module.exports = {
  createProject,
  getUserProjects,
  getAssignedProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  addMilestone,
  updateMilestone,
  updateStage,
  addDocument,
  removeDocument,
  inviteMember,
  removeMember,
};

