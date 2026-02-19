/**
 * MongoDB - Flexible document-oriented database
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🍃
 * @tags mongodb, nosql, database
 * @dependencies mongodb@^6.3.0
 */

import { MongoClient, Db, ObjectId } from 'mongodb';

export default class MongoDB {
  private client: MongoClient;
  private db: Db;

  constructor(uri: string, database: string) {
    if (!uri || !database) {
      throw new Error('MongoDB requires uri and database parameters');
    }
    this.client = new MongoClient(uri);
    this.db = null as any;
  }

  async onInitialize() {
    await this.client.connect();
    this.db = this.client.db(this.client.options.authSource);
    await this.db.command({ ping: 1 });
  }

  async onShutdown() {
    await this.client.close();
  }

  /**
   * Find documents in a collection
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter (MongoDB query object)
   * @param limit Max documents to return {@min 1} {@max 1000}
   * @param sort Sort specification
   * @format table
   */
  async find(params: { collection: string; filter?: object; limit?: number; sort?: object }) {
    const col = this.db.collection(params.collection);
    let cursor = col.find(params.filter ?? {}).limit(params.limit ?? 10);
    if (params.sort) cursor = cursor.sort(params.sort);
    const documents = await cursor.toArray();
    return { collection: params.collection, count: documents.length, documents: documents.map((d) => this._serialize(d)) };
  }

  /**
   * Find a single document
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter (MongoDB query object)
   * @format card
   */
  async findOne(params: { collection: string; filter: object }) {
    const col = this.db.collection(params.collection);
    const document = await col.findOne(params.filter);
    if (!document) throw new Error('Document not found');
    return { collection: params.collection, document: this._serialize(document) };
  }

  /**
   * Insert a document
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param document Document to insert
   */
  async insertOne(params: { collection: string; document: object }) {
    const col = this.db.collection(params.collection);
    const result = await col.insertOne(params.document);
    return { collection: params.collection, insertedId: result.insertedId.toString() };
  }

  /**
   * Insert multiple documents
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param documents Array of documents to insert
   */
  async insertMany(params: { collection: string; documents: object[] }) {
    const col = this.db.collection(params.collection);
    const result = await col.insertMany(params.documents);
    return {
      collection: params.collection,
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds).map((id) => id.toString()),
    };
  }

  /**
   * Update a document
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter to match documents
   * @param update Update operations (e.g., {"$set":{"name":"John"}})
   * @param upsert Create document if it doesn't exist
   */
  async updateOne(params: { collection: string; filter: object; update: object; upsert?: boolean }) {
    const col = this.db.collection(params.collection);
    const result = await col.updateOne(params.filter, params.update, { upsert: params.upsert ?? false });
    return {
      collection: params.collection,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId?.toString(),
    };
  }

  /**
   * Update multiple documents
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter to match documents
   * @param update Update operations
   */
  async updateMany(params: { collection: string; filter: object; update: object }) {
    const col = this.db.collection(params.collection);
    const result = await col.updateMany(params.filter, params.update);
    return {
      collection: params.collection,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete a document
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter to match document
   */
  async removeOne(params: { collection: string; filter: object }) {
    const col = this.db.collection(params.collection);
    const result = await col.deleteOne(params.filter);
    if (result.deletedCount === 0) throw new Error('No document matched the filter');
    return { collection: params.collection, deletedCount: result.deletedCount };
  }

  /**
   * Delete multiple documents
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter to match documents
   */
  async removeMany(params: { collection: string; filter: object }) {
    const col = this.db.collection(params.collection);
    const result = await col.deleteMany(params.filter);
    return { collection: params.collection, deletedCount: result.deletedCount };
  }

  /**
   * Run aggregation pipeline
   * @param collection Collection name {@example orders} {@min 1} {@max 120}
   * @param pipeline Aggregation pipeline array
   * @format table
   */
  async aggregate(params: { collection: string; pipeline: object[] }) {
    const col = this.db.collection(params.collection);
    const results = await col.aggregate(params.pipeline).toArray();
    return { collection: params.collection, count: results.length, results: results.map((r) => this._serialize(r)) };
  }

  /**
   * Count documents matching filter
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param filter Query filter (counts all if omitted)
   * @autorun
   */
  async count(params: { collection: string; filter?: object }) {
    const col = this.db.collection(params.collection);
    const count = await col.countDocuments(params.filter ?? {});
    return { collection: params.collection, count };
  }

  /**
   * List all collections in database
   * @autorun
   * @format table
   */
  async collections() {
    const collections = await this.db.listCollections().toArray();
    return {
      count: collections.length,
      collections: collections.map((col) => ({ name: col.name, type: col.type })),
    };
  }

  /**
   * Create an index on a collection
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param keys Index specification (e.g., {"email":1})
   * @param unique Create unique index
   */
  async index(params: { collection: string; keys: object; unique?: boolean }) {
    const col = this.db.collection(params.collection);
    const indexName = await col.createIndex(params.keys, { unique: params.unique ?? false });
    return { collection: params.collection, indexName };
  }

  /**
   * Get distinct values for a field
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   * @param field Field name {@example country} {@min 1} {@max 200}
   * @param filter Optional query filter
   * @format table
   */
  async distinct(params: { collection: string; field: string; filter?: object }) {
    const col = this.db.collection(params.collection);
    const values = await col.distinct(params.field, params.filter ?? {});
    return { collection: params.collection, field: params.field, count: values.length, values };
  }

  /**
   * Drop a collection
   * @param collection Collection name {@example users} {@min 1} {@max 120}
   */
  async drop(params: { collection: string }) {
    const col = this.db.collection(params.collection);
    await col.drop();
  }

  // ========== TESTS ==========

  private testCollection = `photon_test_${Date.now()}`;

  private isConnected(): boolean {
    return this.db !== undefined;
  }

  async testAfterAll() {
    if (this.isConnected()) {
      try {
        await this.drop({ collection: this.testCollection });
      } catch {}
    }
  }

  async testCollections() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    const result = await this.collections();
    if (!Array.isArray(result.collections)) throw new Error('Collections should be array');
    return { passed: true };
  }

  async testInsertFind() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    await this.insertOne({ collection: this.testCollection, document: { name: 'Test', value: 42 } });
    const result = await this.find({ collection: this.testCollection, filter: { name: 'Test' } });
    if (result.count === 0) throw new Error('Document not found');
    if (result.documents[0].value !== 42) throw new Error('Wrong value');
    return { passed: true };
  }

  async testCount() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    const result = await this.count({ collection: this.testCollection });
    if (typeof result.count !== 'number') throw new Error('Count should be number');
    return { passed: true };
  }

  async testDelete() {
    if (!this.isConnected()) return { skipped: true, reason: 'MongoDB not connected' };
    await this.insertOne({ collection: this.testCollection, document: { toDelete: true } });
    const result = await this.removeOne({ collection: this.testCollection, filter: { toDelete: true } });
    if (result.deletedCount === 0) throw new Error('Document not deleted');
    return { passed: true };
  }

  // ========== HELPERS ==========

  private _serialize(doc: any): any {
    if (!doc) return doc;
    if (doc._id instanceof ObjectId) doc._id = doc._id.toString();
    Object.keys(doc).forEach((key) => {
      if (doc[key] instanceof ObjectId) {
        doc[key] = doc[key].toString();
      } else if (Array.isArray(doc[key])) {
        doc[key] = doc[key].map((item) => this._serialize(item));
      } else if (typeof doc[key] === 'object' && doc[key] !== null) {
        doc[key] = this._serialize(doc[key]);
      }
    });
    return doc;
  }
}
