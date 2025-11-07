/**
 * Redis - In-memory data store and cache
 *
 * Provides Redis operations using the official Redis client.
 * Supports key-value operations, lists, hashes, sets, and pub/sub patterns.
 *
 * Common use cases:
 * - Caching: "Cache user session for 1 hour", "Get cached API response"
 * - Counters: "Increment page view counter", "Get current visitor count"
 * - Lists/Queues: "Add job to queue", "Get next job from queue"
 * - Pub/Sub: "Publish message to channel", "Subscribe to events"
 *
 * Example: set({ key: "user:123", value: "John", ttl: 3600 })
 *
 * Configuration:
 * - url: Redis connection URL (default: redis://localhost:6379)
 * - password: Redis password (optional)
 * - database: Database number (default: 0)
 *
 * @dependencies redis@^4.6.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import { createClient, RedisClientType } from 'redis';

export default class Redis {
  private client: RedisClientType;
  private url: string;

  constructor(
    url: string = 'redis://localhost:6379',
    password?: string,
    database: number = 0
  ) {
    this.url = url;

    const options: any = {
      url,
      database,
    };

    if (password) {
      options.password = password;
    }

    this.client = createClient(options);

    // Error handling
    this.client.on('error', (err) => {
      console.error('[redis] Error:', err.message);
    });
  }

  async onInitialize() {
    try {
      await this.client.connect();

      // Test connection
      await this.client.ping();

      const info = await this.client.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';

      console.error('[redis] ✅ Connected to Redis');
      console.error(`[redis] Version: ${version}`);
      console.error(`[redis] URL: ${this.url}`);
    } catch (error: any) {
      console.error('[redis] ❌ Connection failed:', error.message);
      throw error;
    }
  }

  async onShutdown() {
    try {
      await this.client.quit();
      console.error('[redis] Connection closed');
    } catch (error: any) {
      console.error('[redis] Error closing connection:', error.message);
    }
  }

  /**
   * Get value by key
   * @param key Key name
   */
  async get(params: { key: string }) {
    try {
      const value = await this.client.get(params.key);

      if (value === null) {
        return {
          success: false,
          error: 'Key not found',
        };
      }

      return {
        success: true,
        key: params.key,
        value,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set key-value pair
   * @param key Key name
   * @param value Value to store
   * @param ttl Time to live in seconds (optional)
   */
  async set(params: { key: string; value: string; ttl?: number }) {
    try {
      if (params.ttl) {
        await this.client.setEx(params.key, params.ttl, params.value);
      } else {
        await this.client.set(params.key, params.value);
      }

      return {
        success: true,
        key: params.key,
        ttl: params.ttl,
        message: 'Key set successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete one or more keys
   * @param keys Array of key names to delete
   */
  async del(params: { keys: string[] }) {
    try {
      const count = await this.client.del(params.keys);

      return {
        success: true,
        deleted: count,
        message: `${count} key(s) deleted`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if key exists
   * @param key Key name
   */
  async exists(params: { key: string }) {
    try {
      const exists = await this.client.exists(params.key);

      return {
        success: true,
        key: params.key,
        exists: exists === 1,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all keys matching pattern
   * @param pattern Key pattern (e.g., "user:*", "*session*")
   */
  async keys(params: { pattern: string }) {
    try {
      const keys = await this.client.keys(params.pattern);

      return {
        success: true,
        pattern: params.pattern,
        count: keys.length,
        keys,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Increment numeric value
   * @param key Key name
   * @param amount Amount to increment by (default: 1)
   */
  async incr(params: { key: string; amount?: number }) {
    try {
      const amount = params.amount || 1;
      const newValue = amount === 1
        ? await this.client.incr(params.key)
        : await this.client.incrBy(params.key, amount);

      return {
        success: true,
        key: params.key,
        value: newValue,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Decrement numeric value
   * @param key Key name
   * @param amount Amount to decrement by (default: 1)
   */
  async decr(params: { key: string; amount?: number }) {
    try {
      const amount = params.amount || 1;
      const newValue = amount === 1
        ? await this.client.decr(params.key)
        : await this.client.decrBy(params.key, amount);

      return {
        success: true,
        key: params.key,
        value: newValue,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set expiration time on key
   * @param key Key name
   * @param seconds Seconds until expiration
   */
  async expire(params: { key: string; seconds: number }) {
    try {
      const result = await this.client.expire(params.key, params.seconds);

      if (result === false) {
        return {
          success: false,
          error: 'Key not found',
        };
      }

      return {
        success: true,
        key: params.key,
        ttl: params.seconds,
        message: 'Expiration set successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get time to live for key
   * @param key Key name
   */
  async ttl(params: { key: string }) {
    try {
      const ttl = await this.client.ttl(params.key);

      let message;
      if (ttl === -2) {
        message = 'Key does not exist';
      } else if (ttl === -1) {
        message = 'Key has no expiration';
      } else {
        message = `Key expires in ${ttl} seconds`;
      }

      return {
        success: true,
        key: params.key,
        ttl,
        message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Push value to list (left side)
   * @param key List key name
   * @param values Array of values to push
   */
  async lpush(params: { key: string; values: string[] }) {
    try {
      const length = await this.client.lPush(params.key, params.values);

      return {
        success: true,
        key: params.key,
        length,
        message: `${params.values.length} item(s) pushed to list`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Push value to list (right side)
   * @param key List key name
   * @param values Array of values to push
   */
  async rpush(params: { key: string; values: string[] }) {
    try {
      const length = await this.client.rPush(params.key, params.values);

      return {
        success: true,
        key: params.key,
        length,
        message: `${params.values.length} item(s) pushed to list`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pop value from list (left side)
   * @param key List key name
   */
  async lpop(params: { key: string }) {
    try {
      const value = await this.client.lPop(params.key);

      if (value === null) {
        return {
          success: false,
          error: 'List is empty or does not exist',
        };
      }

      return {
        success: true,
        key: params.key,
        value,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pop value from list (right side)
   * @param key List key name
   */
  async rpop(params: { key: string }) {
    try {
      const value = await this.client.rPop(params.key);

      if (value === null) {
        return {
          success: false,
          error: 'List is empty or does not exist',
        };
      }

      return {
        success: true,
        key: params.key,
        value,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get list length
   * @param key List key name
   */
  async llen(params: { key: string }) {
    try {
      const length = await this.client.lLen(params.key);

      return {
        success: true,
        key: params.key,
        length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get hash field value
   * @param key Hash key name
   * @param field Field name
   */
  async hget(params: { key: string; field: string }) {
    try {
      const value = await this.client.hGet(params.key, params.field);

      if (value === null) {
        return {
          success: false,
          error: 'Field not found',
        };
      }

      return {
        success: true,
        key: params.key,
        field: params.field,
        value,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set hash field value
   * @param key Hash key name
   * @param field Field name
   * @param value Value to set
   */
  async hset(params: { key: string; field: string; value: string }) {
    try {
      await this.client.hSet(params.key, params.field, params.value);

      return {
        success: true,
        key: params.key,
        field: params.field,
        message: 'Hash field set successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all fields and values in hash
   * @param key Hash key name
   */
  async hgetall(params: { key: string }) {
    try {
      const hash = await this.client.hGetAll(params.key);

      return {
        success: true,
        key: params.key,
        count: Object.keys(hash).length,
        hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Flush all data from current database
   */
  async flush() {
    try {
      await this.client.flushDb();

      return {
        success: true,
        message: 'Database flushed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
