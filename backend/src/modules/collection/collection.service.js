/**
 * Planova - Collection Service
 * Business logic for folder-based wishlists/collections
 */

const mongoose = require('mongoose');
const Collection = require('./collection.model');
const ApiError = require('../../utils/ApiError');

class CollectionService {
  /**
   * Create a new collection
   */
  async createCollection(userId, data) {
    const existing = await Collection.findOne({ userId, name: data.name });
    if (existing) {
      throw new ApiError(409, 'A collection with this name already exists', [], '', 'name');
    }
    const collection = await Collection.create({ ...data, userId });
    return collection;
  }

  /**
   * Get all collections for a user
   */
  async getUserCollections(userId) {
    return Collection.find({ userId }).sort({ sortOrder: 1, createdAt: -1 });
  }

  /**
   * Get collection by ID
   */
  async getCollectionById(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new ApiError(400, 'Invalid collection ID');
    }
    const collection = await Collection.findById(collectionId)
      .populate('items.blueprints', 'title slug specs.builtUpArea specs.estimatedCost specs.style files.images specs.bedrooms specs.floors metrics specs.bathrooms')
      .populate('items.engineers', 'firstName lastName avatar engineerProfile.title engineerProfile.rating engineerProfile.specializations')
      .populate('items.plots', 'name dimensions area address.city geojson')
      .populate('items.materials', 'name price images category');
    if (!collection) throw new ApiError(404, 'Collection not found');
    return collection;
  }

  /**
   * Update collection
   */
  async updateCollection(collectionId, userId, data) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new ApiError(400, 'Invalid collection ID');
    }
    if (data.name) {
      const dup = await Collection.findOne({ userId, name: data.name, _id: { $ne: collectionId } });
      if (dup) throw new ApiError(409, 'A collection with this name already exists');
    }
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!collection) throw new ApiError(404, 'Collection not found');
    return collection;
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new ApiError(400, 'Invalid collection ID');
    }
    const collection = await Collection.findOneAndDelete({ _id: collectionId, userId });
    if (!collection) throw new ApiError(404, 'Collection not found');
    return true;
  }

  /**
   * Add item to collection
   */
  async addItem(collectionId, userId, itemType, itemId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid ID format');
    }
    const validTypes = ['blueprints', 'engineers', 'plots', 'materials'];
    if (!validTypes.includes(itemType)) {
      throw new ApiError(400, `Invalid item type. Must be one of: ${validTypes.join(', ')}`);
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new ApiError(404, 'Collection not found');

    const itemField = `items.${itemType}`;
    const existing = collection.items[itemType].find(id => id.toString() === itemId);
    if (existing) throw new ApiError(409, 'Item already in collection');

    collection.items[itemType].push(itemId);
    await collection.save();
    return collection;
  }

  /**
   * Remove item from collection
   */
  async removeItem(collectionId, userId, itemType, itemId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      throw new ApiError(400, 'Invalid ID format');
    }
    const validTypes = ['blueprints', 'engineers', 'plots', 'materials'];
    if (!validTypes.includes(itemType)) {
      throw new ApiError(400, `Invalid item type`);
    }

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new ApiError(404, 'Collection not found');

    collection.items[itemType] = collection.items[itemType].filter(id => id.toString() !== itemId);
    await collection.save();
    return collection;
  }

  /**
   * Toggle item in default collection (quick save/unsave)
   */
  async toggleItem(userId, itemType, itemId) {
    const defaultColl = await Collection.getDefault(userId);
    const itemField = `items.${itemType}`;
    const exists = defaultColl.items[itemType].find(id => id.toString() === itemId);
    if (exists) {
      defaultColl.items[itemType] = defaultColl.items[itemType].filter(id => id.toString() !== itemId);
      await defaultColl.save();
      return { saved: false, collection: defaultColl };
    } else {
      defaultColl.items[itemType].push(itemId);
      await defaultColl.save();
      return { saved: true, collection: defaultColl };
    }
  }
}

module.exports = new CollectionService();

