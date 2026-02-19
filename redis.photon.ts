/**
 * Redis - High-performance in-memory data store
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon ⚡
 * @tags redis, cache, key-value
 * @dependencies redis@^4.6.0
 */

import { createClient, RedisClientType } from 'redis';

export default class Redis {
  private client: RedisClientType;

  constructor(url: string = 'redis://localhost:6379', password?: string, database: number = 0) {
    this.client = createClient({
      url,
      database,
      ...(password && { password }),
    });
    this.client.on('error', () => {});
  }

  async onInitialize() {
    await this.client.connect();
    await this.client.ping();
  }

  async onShutdown() {
    await this.client.quit().catch(() => {});
  }

  /**
   * Get value by key
   * @param key Key name {@example user:123:session} {@min 1} {@max 512}
   */
  async get(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const value = await this.client.get(key);
    if (value === null) throw new Error('Key not found');
    return { key, value };
  }

  /**
   * Set key-value pair
   * @param key Key name {@example user:123:name} {@min 1} {@max 512}
   * @param value Value to store {@example John}
   * @param ttl Time to live in seconds (max 30 days) {@min 1} {@max 2592000}
   */
  async set(params: { key: string; value: string; ttl?: number } | string, value?: string, ttl?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const val = typeof params === 'string' ? value! : params.value;
    const ttlValue = typeof params === 'string' ? ttl : params.ttl;

    if (ttlValue) {
      await this.client.setEx(key, ttlValue, val);
    } else {
      await this.client.set(key, val);
    }
    return { key, ttl: ttlValue };
  }

  /**
   * Delete one or more keys
   * @param keys Key name(s) to delete {@example ["user:123","user:124"]}
   */
  async del(params: { keys: string[] } | string | string[], ...additionalKeys: string[]) {
    let keys: string[];
    if (typeof params === 'string') {
      keys = [params, ...additionalKeys];
    } else if (Array.isArray(params)) {
      keys = params;
    } else {
      keys = params.keys;
    }
    const count = await this.client.del(keys);
    return { deleted: count };
  }

  /**
   * Check if key exists
   * @param key Key name {@example user:123} {@min 1} {@max 512}
   */
  async exists(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const exists = await this.client.exists(key);
    return { key, exists: exists === 1 };
  }

  /**
   * Get all keys matching pattern
   * @param pattern Key pattern {@example user:*} {@min 1} {@max 200}
   * @format table
   */
  async keys(params: { pattern: string } | string) {
    const pattern = typeof params === 'string' ? params : params.pattern;
    const keys = await this.client.keys(pattern);
    return { pattern, count: keys.length, keys };
  }

  /**
   * Increment numeric value
   * @param key Key name {@example counter:page_views} {@min 1} {@max 512}
   * @param amount Amount to increment by {@min 1}
   */
  async incr(params: { key: string; amount?: number } | string, amount?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const incrementAmount = typeof params === 'string' ? amount ?? 1 : params.amount ?? 1;
    const newValue = incrementAmount === 1 ? await this.client.incr(key) : await this.client.incrBy(key, incrementAmount);
    return { key, value: newValue };
  }

  /**
   * Decrement numeric value
   * @param key Key name {@example counter:stock} {@min 1} {@max 512}
   * @param amount Amount to decrement by {@min 1}
   */
  async decr(params: { key: string; amount?: number } | string, amount?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const decrementAmount = typeof params === 'string' ? amount ?? 1 : params.amount ?? 1;
    const newValue = decrementAmount === 1 ? await this.client.decr(key) : await this.client.decrBy(key, decrementAmount);
    return { key, value: newValue };
  }

  /**
   * Set expiration time on key
   * @param key Key name {@example session:123} {@min 1} {@max 512}
   * @param seconds Seconds until expiration (max 30 days) {@min 1} {@max 2592000}
   */
  async expire(params: { key: string; seconds: number } | string, seconds?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const ttl = typeof params === 'string' ? seconds! : params.seconds;
    const result = await this.client.expire(key, ttl);
    if (result === false) throw new Error('Key not found');
    return { key, ttl };
  }

  /**
   * Get time to live for key
   * @param key Key name {@example session:123} {@min 1} {@max 512}
   */
  async ttl(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const ttl = await this.client.ttl(key);
    const message =
      ttl === -2 ? 'Key does not exist' : ttl === -1 ? 'Key has no expiration' : `Key expires in ${ttl} seconds`;
    return { key, ttl, message };
  }

  /**
   * Push value to list (left side)
   * @param key List key name {@example queue:jobs} {@min 1} {@max 512}
   * @param values Array of values to push {@example ["job1","job2"]}
   */
  async lpush(params: { key: string; values: string[] } | string, values?: string | string[], ...additionalValues: string[]) {
    let key: string;
    let vals: string[];

    if (typeof params === 'string') {
      key = params;
      vals = Array.isArray(values) ? values : values ? [values, ...additionalValues] : [];
    } else {
      key = params.key;
      vals = params.values;
    }

    const length = await this.client.lPush(key, vals);
    return { key, length };
  }

  /**
   * Push value to list (right side)
   * @param key List key name {@example queue:jobs} {@min 1} {@max 512}
   * @param values Array of values to push {@example ["job1","job2"]}
   */
  async rpush(params: { key: string; values: string[] } | string, values?: string | string[], ...additionalValues: string[]) {
    let key: string;
    let vals: string[];

    if (typeof params === 'string') {
      key = params;
      vals = Array.isArray(values) ? values : values ? [values, ...additionalValues] : [];
    } else {
      key = params.key;
      vals = params.values;
    }

    const length = await this.client.rPush(key, vals);
    return { key, length };
  }

  /**
   * Pop value from list (left side)
   * @param key List key name {@example queue:jobs} {@min 1} {@max 512}
   */
  async lpop(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const value = await this.client.lPop(key);
    if (value === null) throw new Error('List is empty or does not exist');
    return { key, value };
  }

  /**
   * Pop value from list (right side)
   * @param key List key name {@example queue:jobs} {@min 1} {@max 512}
   */
  async rpop(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const value = await this.client.rPop(key);
    if (value === null) throw new Error('List is empty or does not exist');
    return { key, value };
  }

  /**
   * Get list length
   * @param key List key name {@example queue:jobs} {@min 1} {@max 512}
   */
  async llen(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const length = await this.client.lLen(key);
    return { key, length };
  }

  /**
   * Get hash field value
   * @param key Hash key name {@example user:123} {@min 1} {@max 512}
   * @param field Field name {@example name} {@min 1} {@max 200}
   */
  async hget(params: { key: string; field: string } | string, field?: string) {
    const key = typeof params === 'string' ? params : params.key;
    const fieldName = typeof params === 'string' ? field! : params.field;
    const value = await this.client.hGet(key, fieldName);
    if (value === null) throw new Error('Field not found');
    return { key, field: fieldName, value };
  }

  /**
   * Set hash field value
   * @param key Hash key name {@example user:123} {@min 1} {@max 512}
   * @param field Field name {@example name} {@min 1} {@max 200}
   * @param value Value to set {@example John}
   */
  async hset(params: { key: string; field: string; value: string } | string, field?: string, value?: string) {
    const key = typeof params === 'string' ? params : params.key;
    const fieldName = typeof params === 'string' ? field! : params.field;
    const val = typeof params === 'string' ? value! : params.value;
    await this.client.hSet(key, fieldName, val);
    return { key, field: fieldName };
  }

  /**
   * Get all fields and values in hash
   * @param key Hash key name {@example user:123} {@min 1} {@max 512}
   * @format table
   */
  async hgetall(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;
    const hash = await this.client.hGetAll(key);
    return { key, count: Object.keys(hash).length, hash };
  }

  /**
   * Flush all data from current database
   */
  async flush() {
    await this.client.flushDb();
  }

  // ========== TESTS ==========

  private testKey = `photon-test-${Date.now()}`;

  private isConnected(): boolean {
    return this.client.isReady;
  }

  async testAfterAll() {
    if (this.isConnected()) {
      try {
        await this.del({ keys: [this.testKey] });
      } catch {}
    }
  }

  async testSetGet() {
    if (!this.isConnected()) return { skipped: true, reason: 'Redis not connected' };
    await this.set({ key: this.testKey, value: 'test-value' });
    const result = await this.get({ key: this.testKey });
    if (result.value !== 'test-value') throw new Error('Value mismatch');
    return { passed: true };
  }

  async testDel() {
    if (!this.isConnected()) return { skipped: true, reason: 'Redis not connected' };
    await this.set({ key: this.testKey, value: 'to-delete' });
    await this.del({ keys: [this.testKey] });
    try {
      await this.get({ key: this.testKey });
      throw new Error('Key should be deleted');
    } catch (e) {
      if ((e as Error).message !== 'Key not found') throw e;
    }
    return { passed: true };
  }

  async testExists() {
    if (!this.isConnected()) return { skipped: true, reason: 'Redis not connected' };
    await this.set({ key: this.testKey, value: 'exists-test' });
    const result = await this.exists({ key: this.testKey });
    if (!result.exists) throw new Error('Key should exist');
    return { passed: true };
  }

  async testSetWithTtl() {
    if (!this.isConnected()) return { skipped: true, reason: 'Redis not connected' };
    await this.set({ key: this.testKey, value: 'ttl-test', ttl: 60 });
    const result = await this.ttl({ key: this.testKey });
    if (result.ttl === undefined || result.ttl <= 0) throw new Error('TTL should be positive');
    return { passed: true };
  }
}
