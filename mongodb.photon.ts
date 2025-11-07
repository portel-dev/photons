/**
 * MongoDB - NoSQL database operations
 *
 * Provides MongoDB database operations using the official MongoDB driver.
 * Supports document CRUD, aggregation pipelines, and collection management.
 *
 * Common use cases:
 * - Document operations: "Find users where age > 25", "Insert new product"
 * - Aggregation: "Group orders by customer and sum totals"
 * - Collection management: "List all collections", "Create index on email field"
 *
 * Example: find({ collection: "users", filter: { age: { $gt: 25 } } })
 *
 * Configuration:
 * - uri: MongoDB connection URI (required)
 * - database: Default database name (required)
 *
 * @dependencies mongodb@^6.3.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import { MongoClient, Db, ObjectId } from 'mongodb';

export default class MongoDB {
  private client: MongoClient;
  private db: Db;
  private uri: string;
  private databaseName: string;

  constructor(uri: string, database: string) {
    if (!uri || !database) {
      throw new Error('MongoDB requires uri and database parameters');
    }

    this.uri = uri;
    this.databaseName = database;
    this.client = new MongoClient(uri);
  }

  async onInitialize() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);

      // Test connection
      await this.db.command({ ping: 1 });

      console.error('[mongodb] ✅ Connected to MongoDB');
      console.error(`[mongodb] Database: ${this.databaseName}`);
    } catch (error: any) {
      console.error('[mongodb] ❌ Connection failed:', error.message);
      throw error;
    }
  }

  async onShutdown() {
    try {
      await this.client.close();
      console.error('[mongodb] Connection closed');
    } catch (error: any) {
      console.error('[mongodb] Error closing connection:', error.message);
    }
  }

  /**
   * Find documents in a collection
   * @param collection Collection name
   * @param filter Query filter (MongoDB query object)
   * @param limit Maximum number of documents to return (default: 10)
   * @param sort Sort specification (e.g., { age: -1 } for descending)
   */
  async find(params: { collection: string; filter?: object; limit?: number; sort?: object }) {
    try {
      const col = this.db.collection(params.collection);

      const cursor = col
        .find(params.filter || {})
        .limit(params.limit || 10);

      if (params.sort) {
        cursor.sort(params.sort);
      }

      const documents = await cursor.toArray();

      return {
        success: true,
        collection: params.collection,
        count: documents.length,
        documents: documents.map(this._serializeDocument),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Find a single document
   * @param collection Collection name
   * @param filter Query filter (MongoDB query object)
   */
  async findOne(params: { collection: string; filter: object }) {
    try {
      const col = this.db.collection(params.collection);
      const document = await col.findOne(params.filter);

      if (!document) {
        return {
          success: false,
          error: 'Document not found',
        };
      }

      return {
        success: true,
        collection: params.collection,
        document: this._serializeDocument(document),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Insert a document
   * @param collection Collection name
   * @param document Document to insert
   */
  async insertOne(params: { collection: string; document: object }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.insertOne(params.document);

      return {
        success: true,
        collection: params.collection,
        insertedId: result.insertedId.toString(),
        message: 'Document inserted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Insert multiple documents
   * @param collection Collection name
   * @param documents Array of documents to insert
   */
  async insertMany(params: { collection: string; documents: object[] }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.insertMany(params.documents);

      return {
        success: true,
        collection: params.collection,
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map((id) => id.toString()),
        message: `${result.insertedCount} documents inserted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a document
   * @param collection Collection name
   * @param filter Query filter to match documents
   * @param update Update operations (e.g., { $set: { name: "John" } })
   * @param upsert Create document if it doesn't exist (default: false)
   */
  async updateOne(params: { collection: string; filter: object; update: object; upsert?: boolean }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.updateOne(params.filter, params.update, {
        upsert: params.upsert || false,
      });

      return {
        success: true,
        collection: params.collection,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId?.toString(),
        message:
          result.modifiedCount > 0
            ? 'Document updated successfully'
            : result.upsertedId
            ? 'Document created via upsert'
            : 'No document matched the filter',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update multiple documents
   * @param collection Collection name
   * @param filter Query filter to match documents
   * @param update Update operations
   */
  async updateMany(params: { collection: string; filter: object; update: object }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.updateMany(params.filter, params.update);

      return {
        success: true,
        collection: params.collection,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} documents updated successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a document
   * @param collection Collection name
   * @param filter Query filter to match document
   */
  async deleteOne(params: { collection: string; filter: object }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.deleteOne(params.filter);

      return {
        success: true,
        collection: params.collection,
        deletedCount: result.deletedCount,
        message:
          result.deletedCount > 0 ? 'Document deleted successfully' : 'No document matched the filter',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete multiple documents
   * @param collection Collection name
   * @param filter Query filter to match documents
   */
  async deleteMany(params: { collection: string; filter: object }) {
    try {
      const col = this.db.collection(params.collection);
      const result = await col.deleteMany(params.filter);

      return {
        success: true,
        collection: params.collection,
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} documents deleted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run aggregation pipeline
   * @param collection Collection name
   * @param pipeline Aggregation pipeline array (e.g., [{ $match: {...} }, { $group: {...} }])
   */
  async aggregate(params: { collection: string; pipeline: object[] }) {
    try {
      const col = this.db.collection(params.collection);
      const results = await col.aggregate(params.pipeline).toArray();

      return {
        success: true,
        collection: params.collection,
        count: results.length,
        results: results.map(this._serializeDocument),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Count documents matching filter
   * @param collection Collection name
   * @param filter Query filter (optional, counts all if omitted)
   */
  async countDocuments(params: { collection: string; filter?: object }) {
    try {
      const col = this.db.collection(params.collection);
      const count = await col.countDocuments(params.filter || {});

      return {
        success: true,
        collection: params.collection,
        count,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all collections in database
   */
  async listCollections(params: {}) {
    try {
      const collections = await this.db.listCollections().toArray();

      return {
        success: true,
        database: this.databaseName,
        count: collections.length,
        collections: collections.map((col) => ({
          name: col.name,
          type: col.type,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create an index on a collection
   * @param collection Collection name
   * @param keys Index specification (e.g., { email: 1 } for ascending)
   * @param unique Create unique index (default: false)
   */
  async createIndex(params: { collection: string; keys: object; unique?: boolean }) {
    try {
      const col = this.db.collection(params.collection);
      const indexName = await col.createIndex(params.keys, {
        unique: params.unique || false,
      });

      return {
        success: true,
        collection: params.collection,
        indexName,
        message: 'Index created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get distinct values for a field
   * @param collection Collection name
   * @param field Field name to get distinct values from
   * @param filter Optional query filter
   */
  async distinct(params: { collection: string; field: string; filter?: object }) {
    try {
      const col = this.db.collection(params.collection);
      const values = await col.distinct(params.field, params.filter || {});

      return {
        success: true,
        collection: params.collection,
        field: params.field,
        count: values.length,
        values,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private helper methods

  private _serializeDocument(doc: any): any {
    if (!doc) return doc;

    // Convert ObjectId to string
    if (doc._id instanceof ObjectId) {
      doc._id = doc._id.toString();
    }

    // Recursively handle nested objects and arrays
    Object.keys(doc).forEach((key) => {
      if (doc[key] instanceof ObjectId) {
        doc[key] = doc[key].toString();
      } else if (Array.isArray(doc[key])) {
        doc[key] = doc[key].map((item) => this._serializeDocument(item));
      } else if (typeof doc[key] === 'object' && doc[key] !== null) {
        doc[key] = this._serializeDocument(doc[key]);
      }
    });

    return doc;
  }
}
