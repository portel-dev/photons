/**
 * PostgreSQL - Powerful relational database
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 🐘
 * @tags postgresql, database, sql
 * @dependencies pg@^8.11.0
 */

import pg from 'pg';
const { Pool } = pg;

interface QueryResult {
  rows: any[];
  rowCount: number;
  fields: Array<{ name: string; dataTypeID: number }>;
}

export default class PostgreSQL {
  private pool?: pg.Pool;

  constructor(
    private database: string,
    private user: string,
    private password: string,
    private host: string = 'localhost',
    private port: number = 5432,
    private ssl: boolean = false
  ) {
    if (!database || !user || !password) {
      throw new Error('Database, user, and password are required');
    }
  }

  async onInitialize() {
    this.pool = new Pool({
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
      ssl: this.ssl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const client = await this.pool.connect();
    client.release();
  }

  async onShutdown() {
    await this.pool?.end();
  }

  /**
   * Execute a SQL query
   * @param sql SQL query {@field textarea} {@example SELECT * FROM users WHERE active = $1}
   * @param params Query parameters (use $1, $2, etc.)
   * @format table
   */
  async query(params: { sql: string; params?: any[] }): Promise<QueryResult> {
    if (!this.pool) throw new Error('Database not initialized');
    const result = await this.pool.query(params.sql, params.params);
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
      fields: result.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
    };
  }

  /**
   * Execute multiple statements in a transaction
   * @param statements Array of SQL statements with optional parameters
   */
  async transaction(params: { statements: Array<{ sql: string; params?: any[] }> }) {
    if (!this.pool) throw new Error('Database not initialized');
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const results = [];
      for (const stmt of params.statements) {
        const result = await client.query(stmt.sql, stmt.params);
        results.push({ rowCount: result.rowCount, rows: result.rows });
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * List all tables in database
   * @param schema Schema name (default: public)
   * @autorun
   * @format table
   */
  async tables(params?: { schema?: string }) {
    if (!this.pool) throw new Error('Database not initialized');
    const schema = params?.schema ?? 'public';
    const result = await this.pool.query(
      `SELECT table_name, table_type FROM information_schema.tables
       WHERE table_schema = $1 ORDER BY table_name`,
      [schema]
    );
    return result.rows.map((row) => ({ name: row.table_name, type: row.table_type }));
  }

  /**
   * Get schema information for a table
   * @param table Table name {@example users}
   * @param schema Schema name (default: public)
   * @format table
   */
  async describe(params: { table: string; schema?: string }) {
    if (!this.pool) throw new Error('Database not initialized');
    const schema = params.schema ?? 'public';
    const result = await this.pool.query(
      `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, params.table]
    );

    if (result.rowCount === 0) throw new Error(`Table ${params.table} not found`);

    return {
      table: params.table,
      schema,
      columns: result.rows.map((row) => ({
        name: row.column_name,
        type: row.data_type,
        maxLength: row.character_maximum_length,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
      })),
    };
  }

  /**
   * List all indexes on a table
   * @param table Table name {@example users}
   * @param schema Schema name (default: public)
   * @format table
   */
  async indexes(params: { table: string; schema?: string }) {
    if (!this.pool) throw new Error('Database not initialized');
    const schema = params.schema ?? 'public';
    const result = await this.pool.query(
      `SELECT i.relname AS index_name, a.attname AS column_name, ix.indisunique AS is_unique, ix.indisprimary AS is_primary
       FROM pg_class t
       JOIN pg_index ix ON t.oid = ix.indrelid
       JOIN pg_class i ON i.oid = ix.indexrelid
       JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
       JOIN pg_namespace n ON n.oid = t.relnamespace
       WHERE t.relname = $1 AND n.nspname = $2
       ORDER BY i.relname, a.attnum`,
      [params.table, schema]
    );

    const indexMap = new Map<string, any>();
    for (const row of result.rows) {
      if (!indexMap.has(row.index_name)) {
        indexMap.set(row.index_name, {
          name: row.index_name,
          columns: [],
          unique: row.is_unique,
          primary: row.is_primary,
        });
      }
      indexMap.get(row.index_name).columns.push(row.column_name);
    }

    return Array.from(indexMap.values());
  }

  /**
   * Insert a document
   * @param table Table name {@example users}
   * @param data Object with column names as keys
   * @param returning Column names to return
   */
  async insert(params: { table: string; data: Record<string, any>; returning?: string[] }) {
    if (!this.pool) throw new Error('Database not initialized');
    const columns = Object.keys(params.data);
    const values = Object.values(params.data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const returning = params.returning ? `RETURNING ${params.returning.join(', ')}` : '';
    const sql = `INSERT INTO ${params.table} (${columns.join(', ')}) VALUES (${placeholders}) ${returning}`;
    const result = await this.pool.query(sql, values);
    return { rowCount: result.rowCount, rows: result.rows };
  }

  /**
   * Get database statistics
   * @autorun
   * @format card
   */
  async stats() {
    if (!this.pool) throw new Error('Database not initialized');
    const sizeResult = await this.pool.query(`SELECT pg_size_pretty(pg_database_size($1)) as size`, [this.database]);
    const tableCountResult = await this.pool.query(
      `SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const connectionResult = await this.pool.query(`SELECT count(*) as count FROM pg_stat_activity WHERE datname = $1`, [
      this.database,
    ]);

    return {
      database: this.database,
      size: sizeResult.rows[0].size,
      tableCount: parseInt(tableCountResult.rows[0].count),
      activeConnections: parseInt(connectionResult.rows[0].count),
    };
  }

  // ========== TESTS ==========

  private isConnected(): boolean {
    return this.pool !== undefined;
  }

  async testQuery() {
    if (!this.isConnected()) return { skipped: true, reason: 'Postgres not connected' };
    const result = await this.query({ sql: 'SELECT 1 as test' });
    if (!result.rows || result.rows.length === 0) throw new Error('No rows returned');
    if (result.rows[0].test !== 1) throw new Error('Wrong value');
    return { passed: true };
  }

  async testQueryWithParams() {
    if (!this.isConnected()) return { skipped: true, reason: 'Postgres not connected' };
    const result = await this.query({ sql: 'SELECT $1::int + $2::int as sum', params: [2, 3] });
    if (result.rows[0].sum !== 5) throw new Error('Wrong calculation');
    return { passed: true };
  }

  async testTables() {
    if (!this.isConnected()) return { skipped: true, reason: 'Postgres not connected' };
    const result = await this.tables();
    if (!Array.isArray(result)) throw new Error('Tables should be array');
    return { passed: true };
  }

  async testStats() {
    if (!this.isConnected()) return { skipped: true, reason: 'Postgres not connected' };
    const result = await this.stats();
    if (!result.database) throw new Error('Missing database name');
    return { passed: true };
  }
}
