/**
 * Planova - Project Service
 * Business logic for construction project management
 */

const mongoose = require('mongoose');
const Project = require('./project.model');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notification/notification.service');
const logger = require('../../utils/logger');

class ProjectService {
  /**
   * Create a new project
   */
  async createProject(userId, projectData) {
    const project = await Project.create({
      ...projectData,
      userId,
      // Initial activity
      activities: [{
        action: 'project_created',
        description: 'Project created',
        userId,
      }],
      // Add owner as first member
      members: [{
        userId,
        role: 'owner',
        acceptedAt: new Date(),
      }],
    });

    logger.info(`Project created for user ${userId}: ${project._id}`);
    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID format');
    }
    const project = await Project.findById(projectId)
      .populate('userId', 'firstName lastName avatar')
      .populate('plotId', 'name address dimensions areaUnit')
      .populate('designId', 'title slug specifications.files.images')
      .populate('blueprintId', 'title slug specs.builtUpArea specs.estimatedCost')
      .populate('engineerId', 'firstName lastName avatar engineerProfile.title engineerProfile.rating')
      .populate('members.userId', 'firstName lastName avatar role');
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

/**
   * Get user's projects
   */
  async getUserProjects(userId, options = {}) {
    return Project.getUserProjects(userId, options);
  }

  /**
   * Get projects assigned to an engineer.
   * An engineer has access if they are `project.engineerId` OR they are a
   * member with role role 'engineer'/'contractor'/'viewer'.
   */
  async getAssignedProjects(engineerId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = {
      isActive: true,
      $or: [
        { engineerId },
        { 'members.userId': engineerId },
      ],
    };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(query)
        .select('name status budget progress.percentage timeline createdAt plotId engineerId userId')
        .populate('userId', 'firstName lastName avatar')
        .populate('plotId', 'name address.city dimensions.area')
        .populate('engineerId', 'firstName lastName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return {
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Resolve whether a user is authorized to access a project:
   * owner, assigned engineer, or a project member.
   */
  async canAccessProject(project, userId, userRole) {
    if (userRole === 'admin') return true;
    if (!project) return false;
    if (project.userId && project.userId.toString() === userId.toString()) return true;
    if (project.engineerId && project.engineerId.toString() === userId.toString()) return true;
    if (Array.isArray(project.members) && project.members.some(m => m.userId && m.userId.toString() === userId.toString())) return true;
    return false;
  }

/**
   * Update project (owner)
   */
  async updateProject(projectId, userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID format');
    }

    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!project) throw new ApiError(404, 'Project not found');

    // Log activity
    project.activities.push({
      action: 'project_updated',
      description: 'Project information updated',
      userId,
    });
    await project.save();

    return project;
  }

  /**
   * Update project authorized for owner, assigned engineer, or member.
   */
  async updateProjectForMember(projectId, userId, updateData) {
    const project = await this.getProjectById(projectId);
    const allowed = await this.canAccessProject(project, userId, 'engineer');
    if (!allowed) throw new ApiError(403, 'Unauthorized to update this project');
    Object.assign(project, updateData);
    project.activities.push({
      action: 'project_updated',
      description: 'Project information updated',
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Update milestone authorized for owner, assigned engineer, or member.
   */
  async updateMilestoneForMember(projectId, userId, milestoneId, updateData) {
    const project = await this.getProjectById(projectId);
    const allowed = await this.canAccessProject(project, userId, 'engineer');
    if (!allowed) throw new ApiError(403, 'Unauthorized to update this project');
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) throw new ApiError(404, 'Milestone not found');
    Object.assign(milestone, updateData);
    project.activities.push({
      action: 'milestone_updated',
      description: `Milestone "${milestone.title}" updated`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Update progress stage authorized for owner, assigned engineer, or member.
   */
  async updateStageForMember(projectId, userId, stageIndex, updateData) {
    const project = await this.getProjectById(projectId);
    const allowed = await this.canAccessProject(project, userId, 'engineer');
    if (!allowed) throw new ApiError(403, 'Unauthorized to update this project');
    if (!project.progress.stages[stageIndex]) throw new ApiError(404, 'Stage not found');
    Object.assign(project.progress.stages[stageIndex], updateData);
    const total = project.progress.stages.reduce((sum, s) => sum + s.percentage, 0);
    project.progress.percentage = Math.min(100, Math.round((total / project.progress.stages.length) * 100) / 100);
    project.activities.push({
      action: 'stage_updated',
      description: `Construction stage ${stageIndex + 1} updated to ${updateData.status || 'in_progress'}`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Add document authorized for owner, assigned engineer, or member.
   */
  async addDocumentForMember(projectId, userId, documentData) {
    const project = await this.getProjectById(projectId);
    const allowed = await this.canAccessProject(project, userId, 'engineer');
    if (!allowed) throw new ApiError(403, 'Unauthorized to add documents to this project');
    project.documents.push({ ...documentData, uploadedBy: userId });
    project.activities.push({
      action: 'document_added',
      description: `Document "${documentData.name}" uploaded`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Remove document authorized for owner, assigned engineer, or member.
   */
  async removeDocumentForMember(projectId, userId, documentId) {
    const project = await this.getProjectById(projectId);
    const allowed = await this.canAccessProject(project, userId, 'engineer');
    if (!allowed) throw new ApiError(403, 'Unauthorized to remove documents from this project');
    const doc = project.documents.id(documentId);
    if (!doc) throw new ApiError(404, 'Document not found');
    project.documents.pull(documentId);
    project.activities.push({
      action: 'document_removed',
      description: `Document "${doc.name}" removed`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Invite member (only project owner may invite).
   */
  async inviteMemberForMember(projectId, userId, inviteUserId, role = 'viewer') {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only project owner can invite members');
    }
    const alreadyMember = project.members.some(m => m.userId.toString() === inviteUserId);
    if (alreadyMember) throw new ApiError(400, 'User is already a member');
    project.members.push({ userId: inviteUserId, role });
    project.activities.push({
      action: 'member_invited',
      description: `New member invited as ${role}`,
      userId,
    });
    await project.save();
    try {
      await notificationService.createNotification(
        inviteUserId,
        'system',
        'Project Invitation',
        `You have been invited to join project "${project.name}"`,
        { projectId: project._id }
      );
    } catch (err) { /* non-blocking */ }
    return project;
  }

  /**
   * Remove member (only project owner may remove).
   */
  async removeMemberForMember(projectId, userId, memberId) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only project owner can remove members');
    }
    project.members.pull({ _id: memberId });
    project.activities.push({
      action: 'member_removed',
      description: 'Member removed from project',
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Update project status
   */
  async updateStatus(projectId, userId, status) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    project.status = status;
    project.activities.push({
      action: 'status_changed',
      description: `Status changed to ${status.replace(/_/g, ' ')}`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Add milestone to project
   */
  async addMilestone(projectId, userId, milestoneData) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    project.milestones.push(milestoneData);
    project.activities.push({
      action: 'milestone_added',
      description: `Milestone "${milestoneData.title}" added`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Update milestone
   */
  async updateMilestone(projectId, userId, milestoneId, updateData) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) throw new ApiError(404, 'Milestone not found');

    Object.assign(milestone, updateData);
    project.activities.push({
      action: 'milestone_updated',
      description: `Milestone "${milestone.title}" updated`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Update progress stage
   */
  async updateStage(projectId, userId, stageIndex, updateData) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    if (!project.progress.stages[stageIndex]) {
      throw new ApiError(404, 'Stage not found');
    }

    Object.assign(project.progress.stages[stageIndex], updateData);
    
    // Auto-calculate overall progress
    const total = project.progress.stages.reduce((sum, s) => sum + s.percentage, 0);
    project.progress.percentage = Math.min(100, Math.round((total / project.progress.stages.length) * 100) / 100);

    project.activities.push({
      action: 'stage_updated',
      description: `Construction stage ${stageIndex + 1} updated to ${updateData.status || 'in_progress'}`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Add document to project
   */
  async addDocument(projectId, userId, documentData) {
    const project = await this.getProjectById(projectId);
    
    // Check membership
    const isMember = project.members.some(m => m.userId.toString() === userId.toString());
    if (!isMember) throw new ApiError(403, 'Only project members can add documents');

    project.documents.push({
      ...documentData,
      uploadedBy: userId,
    });
    project.activities.push({
      action: 'document_added',
      description: `Document "${documentData.name}" uploaded`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Remove document from project
   */
  async removeDocument(projectId, userId, documentId) {
    const project = await this.getProjectById(projectId);
    const doc = project.documents.id(documentId);
    if (!doc) throw new ApiError(404, 'Document not found');
    
    project.documents.pull(documentId);
    project.activities.push({
      action: 'document_removed',
      description: `Document "${doc.name}" removed`,
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Invite member to project
   */
  async inviteMember(projectId, userId, inviteUserId, role = 'viewer') {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only project owner can invite members');
    }

    const alreadyMember = project.members.some(m => m.userId.toString() === inviteUserId);
    if (alreadyMember) {
      throw new ApiError(400, 'User is already a member');
    }

    project.members.push({ userId: inviteUserId, role });
    project.activities.push({
      action: 'member_invited',
      description: `New member invited as ${role}`,
      userId,
    });
    await project.save();

    // Send notification
    try {
      await notificationService.createNotification(
        inviteUserId,
        'system',
        'Project Invitation',
        `You have been invited to join project "${project.name}"`,
        { projectId: project._id }
      );
    } catch (err) { /* non-blocking */ }

    return project;
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId, userId, memberId) {
    const project = await this.getProjectById(projectId);
    if (project.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only project owner can remove members');
    }

    project.members.pull({ _id: memberId });
    project.activities.push({
      action: 'member_removed',
      description: 'Member removed from project',
      userId,
    });
    await project.save();
    return project;
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId, userId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid project ID format');
    }
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { isActive: false },
      { new: true }
    );
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  /**
   * Archive project
   */
  async archiveProject(projectId, userId) {
    return this.updateProject(projectId, userId, { isActive: false });
  }
}

module.exports = new ProjectService();

