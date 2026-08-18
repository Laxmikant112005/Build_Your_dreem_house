/**
 * BuildMyHome - Global Search Service
 * Search across all major entities using MongoDB aggregation
 */

const mongoose = require('mongoose');
const Project = require('../project/project.model');
const User = require('../user/user.model');
const Blueprint = require('../blueprint/blueprint.model');
const Document = require('../document/document.model');
const { Chat } = require('../chat/chat.model');

class SearchService {
  /**
   * Global search across multiple entity types
   */
  async search(userId, query, options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      types = [],        // filter by entity types: ['projects','properties','blueprints','engineers','documents','chats']
      sortBy = 'relevance', 
      sortOrder = 'desc' 
    } = options;

    if (!query || query.trim().length < 2) {
      return {
        results: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        suggestions: [],
      };
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const skip = (page - 1) * limit;
    const results = [];
    let totalResults = 0;
    const activeTypes = types.length > 0 ? types : ['projects', 'blueprints', 'engineers', 'documents', 'chats'];

    // Search Projects
    if (activeTypes.includes('projects')) {
      const projectQuery = {
        $and: [
          { userId: new mongoose.Types.ObjectId(userId) },
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { location: searchRegex },
              { tags: searchRegex },
            ],
          },
        ],
      };

      const projects = await Project.find(projectQuery)
        .select('name description location status type createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const projectCount = await Project.countDocuments(projectQuery);

      projects.forEach(p => {
        results.push({
          _id: p._id,
          type: 'project',
          title: p.name,
          description: p.description?.substring(0, 200) || '',
          subtitle: p.location || p.status || '',
          image: null,
          url: `/user/projects/${p._id}`,
          createdAt: p.createdAt,
          score: this.calculateRelevance(query, p.name, p.description),
        });
      });
      totalResults += projectCount;
    }

    // Search Blueprints (Designs)
    if (activeTypes.includes('blueprints')) {
      const blueprintQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { style: searchRegex },
          { tags: searchRegex },
        ],
      };

      const blueprints = await Blueprint.find(blueprintQuery)
        .select('title description style images price category createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const blueprintCount = await Blueprint.countDocuments(blueprintQuery);

      blueprints.forEach(b => {
        results.push({
          _id: b._id,
          type: 'blueprint',
          title: b.title,
          description: b.description?.substring(0, 200) || '',
          subtitle: b.style || b.category || '',
          image: b.images?.[0] || null,
          url: `/blueprints/${b._id}`,
          createdAt: b.createdAt,
          score: this.calculateRelevance(query, b.title, b.description),
        });
      });
      totalResults += blueprintCount;
    }

    // Search Engineers
    if (activeTypes.includes('engineers')) {
      const engineerQuery = {
        role: 'engineer',
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { 'engineerProfile.specialization': searchRegex },
          { 'engineerProfile.skills': searchRegex },
          { location: searchRegex },
        ],
      };

      const engineers = await User.find(engineerQuery)
        .select('firstName lastName avatar engineerProfile location createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const engineerCount = await User.countDocuments(engineerQuery);

      engineers.forEach(e => {
        results.push({
          _id: e._id,
          type: 'engineer',
          title: `${e.firstName} ${e.lastName}`,
          description: e.engineerProfile?.specialization?.join(', ') || '',
          subtitle: e.location || 'Engineer',
          image: e.avatar || null,
          url: `/user/engineers/${e._id}`,
          createdAt: e.createdAt,
          score: this.calculateRelevance(query, `${e.firstName} ${e.lastName}`, ''),
        });
      });
      totalResults += engineerCount;
    }

    // Search Documents
    if (activeTypes.includes('documents')) {
      const docQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { folder: searchRegex },
        ],
      };

      const docs = await Document.find(docQuery)
        .select('name description category folder file.url file.mimeType createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const docCount = await Document.countDocuments(docQuery);

      docs.forEach(d => {
        results.push({
          _id: d._id,
          type: 'document',
          title: d.name,
          description: d.description?.substring(0, 200) || '',
          subtitle: d.category || d.folder || '',
          image: d.file?.mimeType?.startsWith('image/') ? d.file.url : null,
          url: `/user/documents`,
          createdAt: d.createdAt,
          score: this.calculateRelevance(query, d.name, d.description),
        });
      });
      totalResults += docCount;
    }

    // Search Chats
    if (activeTypes.includes('chats')) {
      const chatQuery = {
        participants: new mongoose.Types.ObjectId(userId),
        isActive: true,
        $or: [
          { name: searchRegex },
          { 'lastMessage.message': searchRegex },
        ],
      };

      const chats = await Chat.find(chatQuery)
        .populate('participants', 'firstName lastName avatar')
        .select('name type lastMessage updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const chatCount = await Chat.countDocuments(chatQuery);

      chats.forEach(c => {
        const other = c.participants?.find(p => p._id.toString() !== userId);
        results.push({
          _id: c._id,
          type: 'chat',
          title: c.name || `${other?.firstName || ''} ${other?.lastName || ''}`.trim() || 'Conversation',
          description: c.lastMessage?.message?.substring(0, 200) || '',
          subtitle: c.type || 'chat',
          image: null,
          url: `/user/chat/${c._id}`,
          createdAt: c.updatedAt,
          score: this.calculateRelevance(query, c.name || '', c.lastMessage?.message || ''),
        });
      });
      totalResults += chatCount;
    }

    // Sort results
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get search suggestions (from recent searches / top matches)
    const suggestions = results.slice(0, 5).map(r => r.title);

    return {
      results: results.slice(skip, skip + limit),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResults,
        totalPages: Math.ceil(totalResults / limit),
      },
      suggestions,
      query: query.trim(),
    };
  }

  /**
   * Calculate a simple relevance score based on title/description matches
   */
  calculateRelevance(query, title, description = '') {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    const lowerDesc = (description || '').toLowerCase();

    // Exact match in title
    if (lowerTitle === lowerQuery) score += 100;
    // Title starts with query
    else if (lowerTitle.startsWith(lowerQuery)) score += 80;
    // Title contains query
    else if (lowerTitle.includes(lowerQuery)) score += 60;
    
    // Description contains query
    if (lowerDesc.includes(lowerQuery)) score += 30;
    // Multiple occurrences
    const titleOccurrences = (lowerTitle.match(new RegExp(lowerQuery, 'g')) || []).length;
    const descOccurrences = (lowerDesc.match(new RegExp(lowerQuery, 'g')) || []).length;
    score += (titleOccurrences - 1) * 10 + descOccurrences * 5;

    return score;
  }
}

module.exports = new SearchService();

