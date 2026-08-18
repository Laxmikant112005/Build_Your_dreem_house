/**
 * Planova - Document Service
 */
const mongoose = require('mongoose');
const Document = require('./document.model');
const ApiError = require('../../utils/ApiError');

class DocumentService {
  async createDocument(userId, data) {
    return Document.create({ ...data, userId });
  }

  async getUserDocuments(userId, options = {}) {
    const { page = 1, limit = 20, category, folder, isFavorite, isArchived = false, search, sortBy = 'createdAt', sortOrder = 'desc', projectId, propertyId } = options;

    const query = { userId, isArchived };

    if (category) query.category = category;
    if (folder) query.folder = folder;
    if (isFavorite !== undefined) query.isFavorite = isFavorite === true || isFavorite === 'true';
    if (projectId) query.projectId = new mongoose.Types.ObjectId(projectId);
    if (propertyId) query.propertyId = new mongoose.Types.ObjectId(propertyId);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Document.countDocuments(query),
    ]);

    // Get folder list and category counts for filter UI
    const [folders, categoryCounts] = await Promise.all([
      Document.getUserFolders(userId),
      Document.getCategoryCounts(userId),
    ]);

    return {
      documents,
      folders,
      categoryCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getDocumentById(docId, userId) {
    if (!mongoose.Types.ObjectId.isValid(docId)) throw new ApiError(400, 'Invalid document ID');
    const doc = await Document.findOne({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    return doc;
  }

  async updateDocument(docId, userId, data) {
    const doc = await Document.findOne({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');

    const allowed = ['name', 'description', 'category', 'folder', 'tags', 'isFavorite', 'isArchived', 'metadata'];
    allowed.forEach(field => {
      if (data[field] !== undefined) doc[field] = data[field];
    });

    await doc.save();
    return doc;
  }

  async deleteDocument(docId, userId) {
    const doc = await Document.findOneAndDelete({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    return true;
  }

  async toggleFavorite(docId, userId) {
    const doc = await Document.findOne({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    doc.isFavorite = !doc.isFavorite;
    await doc.save();
    return doc;
  }

  async archiveDocument(docId, userId) {
    const doc = await Document.findOne({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    doc.isArchived = !doc.isArchived;
    await doc.save();
    return doc;
  }

  async createFolder(userId, folderName) {
    const existing = await Document.findOne({ userId, folder: folderName, isArchived: false });
    if (existing) throw new ApiError(409, 'Folder already exists');
    return { name: folderName, createdAt: new Date() };
  }

  async moveToFolder(docId, userId, folderName) {
    const doc = await Document.findOne({ _id: docId, userId });
    if (!doc) throw new ApiError(404, 'Document not found');
    doc.folder = folderName;
    await doc.save();
    return doc;
  }

  async getRecentDocuments(userId, limit = 10) {
    return Document.find({ userId, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
  }

  async getStorageStats(userId) {
    const stats = await Document.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$file.size' },
          totalDocuments: { $sum: 1 },
          byCategory: { $push: { category: '$category', size: '$file.size' } },
        },
      },
    ]);

    if (stats.length === 0) {
      return { totalSize: 0, totalDocuments: 0, byCategory: [] };
    }

    return stats[0];
  }
}

module.exports = new DocumentService();

