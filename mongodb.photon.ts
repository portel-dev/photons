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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter Query filter (MongoDB query object) {@example {"age":{"$gt":25}}}
   * @param limit {@min 1} {@max 1000} Maximum number of documents to return (default: 10)
   * @param sort Sort specification {@example {"age":-1}}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter {@min 1} Query filter (MongoDB query object) {@example {"email":"user@example.com"}}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param document {@min 1} Document to insert {@example {"name":"John","email":"john@example.com","age":30}}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param documents {@min 1} Array of documents to insert {@example [{"name":"John"},{"name":"Jane"}]}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter {@min 1} Query filter to match documents {@example {"email":"user@example.com"}}
   * @param update {@min 1} Update operations {@example {"$set":{"name":"John"}}}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter {@min 1} Query filter to match documents {@example {"age":{"$gt":25}}}
   * @param update {@min 1} Update operations {@example {"$inc":{"loginCount":1}}}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter {@min 1} Query filter to match document {@example {"email":"user@example.com"}}
   */
  async removeOne(params: { collection: string; filter: object }) {
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter {@min 1} Query filter to match documents {@example {"status":"inactive"}}
   */
  async removeMany(params: { collection: string; filter: object }) {
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
   * @param collection {@min 1} {@max 120} Collection name {@example orders}
   * @param pipeline {@min 1} Aggregation pipeline array {@example [{"$match":{"status":"completed"}},{"$group":{"_id":"$customerId","total":{"$sum":"$amount"}}}]}
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param filter Query filter (optional, counts all if omitted) {@example {"status":"active"}}
   */
  async count(params: { collection: string; filter?: object }) {
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
  async collections() {
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param keys {@min 1} Index specification {@example {"email":1}}
   * @param unique Create unique index (default: false)
   */
  async index(params: { collection: string; keys: object; unique?: boolean }) {
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
   * @param collection {@min 1} {@max 120} Collection name {@example users}
   * @param field {@min 1} {@max 200} Field name to get distinct values from {@example country}
   * @param filter Optional query filter {@example {"status":"active"}}
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

  // ========== TESTS ==========

  private testCollection = `photon_test_${Date.now()}`;

  /** Check if MongoDB is connected */
  private isConnected(): boolean {
    return this.db !== undefined;
  }

  /** Teardown: cleanup test collection */
  async testAfterAll() {
    if (this.isConnected()) {
      try { await this.drop({ collection: this.testCollection }); } catch {}
    }
  }

  /** Test list collections */
  async testCollections() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    const result = await this.collections();
    if (!result.success) throw new Error(result.error);
    if (!Array.isArray(result.collections)) throw new Error('Collections should be array');
    return { passed: true };
  }

  /** Test insert and find */
  async testInsertFind() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    const insertResult = await this.insertOne({
      collection: this.testCollection,
      document: { name: 'Test', value: 42 }
    });
    if (!insertResult.success) throw new Error(insertResult.error);

    const findResult = await this.find({
      collection: this.testCollection,
      filter: { name: 'Test' }
    });
    if (!findResult.success) throw new Error(findResult.error);
    if (findResult.count === 0) throw new Error('Document not found');
    if (findResult.documents[0].value !== 42) throw new Error('Wrong value');
    return { passed: true };
  }

  /** Test count */
  async testCount() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    const result = await this.count({ collection: this.testCollection });
    if (!result.success) throw new Error(result.error);
    if (typeof result.count !== 'number') throw new Error('Count should be number');
    return { passed: true };
  }

  /** Test delete */
  async testDelete() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    await this.insertOne({
      collection: this.testCollection,
      document: { toDelete: true }
    });
    const result = await this.deleteOne({
      collection: this.testCollection,
      filter: { toDelete: true }
    });
    if (!result.success) throw new Error(result.error);
    return { passed: true };
  }
}
