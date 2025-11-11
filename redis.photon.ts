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
   * @param key {@min 1} {@max 512} Key name {@example user:123:session}
   */
  async get(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const value = await this.client.get(key);

      if (value === null) {
        return {
          success: false,
          error: 'Key not found',
        };
      }

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} Key name {@example user:123:name}
   * @param value {@min 1} Value to store {@example John}
   * @param ttl {@min 1} {@max 2592000} Time to live in seconds (optional, max 30 days) {@example 3600}
   */
  async set(params: { key: string; value: string; ttl?: number } | string, value?: string, ttl?: number) {
    // Support both set("key", "value", ttl) and set({ key, value, ttl })
    const key = typeof params === 'string' ? params : params.key;
    const val = typeof params === 'string' ? value! : params.value;
    const ttlValue = typeof params === 'string' ? ttl : params.ttl;

    try {
      if (ttlValue) {
        await this.client.setEx(key, ttlValue, val);
      } else {
        await this.client.set(key, val);
      }

      return {
        success: true,
        key,
        ttl: ttlValue,
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
   * @param keys {@min 1} Key name(s) to delete (string or array) {@example ["user:123","user:124"]}
   */
  async del(params: { keys: string[] } | string | string[], ...additionalKeys: string[]) {
    // Support del("key"), del(["key1", "key2"]), or del("key1", "key2", "key3")
    let keys: string[];
    if (typeof params === 'string') {
      keys = [params, ...additionalKeys];
    } else if (Array.isArray(params)) {
      keys = params;
    } else {
      keys = params.keys;
    }

    try {
      const count = await this.client.del(keys);

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
   * @param key {@min 1} {@max 512} Key name {@example user:123}
   */
  async exists(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const exists = await this.client.exists(key);

      return {
        success: true,
        key,
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
   * @param pattern {@min 1} {@max 200} Key pattern {@example user:*}
   */
  async keys(params: { pattern: string } | string) {
    const pattern = typeof params === 'string' ? params : params.pattern;

    try {
      const keys = await this.client.keys(pattern);

      return {
        success: true,
        pattern,
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
   * @param key {@min 1} {@max 512} Key name {@example counter:page_views}
   * @param amount {@min 1} Amount to increment by (default: 1) {@example 5}
   */
  async incr(params: { key: string; amount?: number } | string, amount?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const incrementAmount = typeof params === 'string' ? (amount || 1) : (params.amount || 1);

    try {
      const newValue = incrementAmount === 1
        ? await this.client.incr(key)
        : await this.client.incrBy(key, incrementAmount);

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} Key name {@example counter:stock}
   * @param amount {@min 1} Amount to decrement by (default: 1) {@example 3}
   */
  async decr(params: { key: string; amount?: number } | string, amount?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const decrementAmount = typeof params === 'string' ? (amount || 1) : (params.amount || 1);

    try {
      const newValue = decrementAmount === 1
        ? await this.client.decr(key)
        : await this.client.decrBy(key, decrementAmount);

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} Key name {@example session:123}
   * @param seconds {@min 1} {@max 2592000} Seconds until expiration (max 30 days) {@example 3600}
   */
  async expire(params: { key: string; seconds: number } | string, seconds?: number) {
    const key = typeof params === 'string' ? params : params.key;
    const ttl = typeof params === 'string' ? seconds! : params.seconds;

    try {
      const result = await this.client.expire(key, ttl);

      if (result === false) {
        return {
          success: false,
          error: 'Key not found',
        };
      }

      return {
        success: true,
        key,
        ttl,
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
   * @param key {@min 1} {@max 512} Key name {@example session:123}
   */
  async ttl(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const ttl = await this.client.ttl(key);

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
        key,
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
   * @param key {@min 1} {@max 512} List key name {@example queue:jobs}
   * @param values {@min 1} Array of values to push {@example ["job1","job2"]}
   */
  async lpush(params: { key: string; values: string[] } | string, values?: string | string[], ...additionalValues: string[]) {
    // Support lpush("key", "val1", "val2"), lpush("key", ["val1", "val2"]), or lpush({ key, values })
    let key: string;
    let vals: string[];

    if (typeof params === 'string') {
      key = params;
      if (Array.isArray(values)) {
        vals = values;
      } else if (values !== undefined) {
        vals = [values, ...additionalValues];
      } else {
        vals = [];
      }
    } else {
      key = params.key;
      vals = params.values;
    }

    try {
      const length = await this.client.lPush(key, vals);

      return {
        success: true,
        key,
        length,
        message: `${vals.length} item(s) pushed to list`,
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
   * @param key {@min 1} {@max 512} List key name {@example queue:jobs}
   * @param values {@min 1} Array of values to push {@example ["job1","job2"]}
   */
  async rpush(params: { key: string; values: string[] } | string, values?: string | string[], ...additionalValues: string[]) {
    // Support rpush("key", "val1", "val2"), rpush("key", ["val1", "val2"]), or rpush({ key, values })
    let key: string;
    let vals: string[];

    if (typeof params === 'string') {
      key = params;
      if (Array.isArray(values)) {
        vals = values;
      } else if (values !== undefined) {
        vals = [values, ...additionalValues];
      } else {
        vals = [];
      }
    } else {
      key = params.key;
      vals = params.values;
    }

    try {
      const length = await this.client.rPush(key, vals);

      return {
        success: true,
        key,
        length,
        message: `${vals.length} item(s) pushed to list`,
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
   * @param key {@min 1} {@max 512} List key name {@example queue:jobs}
   */
  async lpop(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const value = await this.client.lPop(key);

      if (value === null) {
        return {
          success: false,
          error: 'List is empty or does not exist',
        };
      }

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} List key name {@example queue:jobs}
   */
  async rpop(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const value = await this.client.rPop(key);

      if (value === null) {
        return {
          success: false,
          error: 'List is empty or does not exist',
        };
      }

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} List key name {@example queue:jobs}
   */
  async llen(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const length = await this.client.lLen(key);

      return {
        success: true,
        key,
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
   * @param key {@min 1} {@max 512} Hash key name {@example user:123}
   * @param field {@min 1} {@max 200} Field name {@example name}
   */
  async hget(params: { key: string; field: string } | string, field?: string) {
    const key = typeof params === 'string' ? params : params.key;
    const fieldName = typeof params === 'string' ? field! : params.field;

    try {
      const value = await this.client.hGet(key, fieldName);

      if (value === null) {
        return {
          success: false,
          error: 'Field not found',
        };
      }

      return {
        success: true,
        key,
        field: fieldName,
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
   * @param key {@min 1} {@max 512} Hash key name {@example user:123}
   * @param field {@min 1} {@max 200} Field name {@example name}
   * @param value {@min 1} Value to set {@example John}
   */
  async hset(params: { key: string; field: string; value: string } | string, field?: string, value?: string) {
    const key = typeof params === 'string' ? params : params.key;
    const fieldName = typeof params === 'string' ? field! : params.field;
    const val = typeof params === 'string' ? value! : params.value;

    try {
      await this.client.hSet(key, fieldName, val);

      return {
        success: true,
        key,
        field: fieldName,
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
   * @param key {@min 1} {@max 512} Hash key name {@example user:123}
   */
  async hgetall(params: { key: string } | string) {
    const key = typeof params === 'string' ? params : params.key;

    try {
      const hash = await this.client.hGetAll(key);

      return {
        success: true,
        key,
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
