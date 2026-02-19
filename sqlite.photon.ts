/**
 * SQLite - File or in-memory SQL database
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 🗄️
 * @tags sqlite, database, sql
 * @dependencies better-sqlite3@^11.0.0
 */

import Database from 'better-sqlite3';

export default class SQLite {
  private db: Database.Database | null = null;

  constructor(private path: string = ':memory:') {}

  async onInitialize() {
    if (this.path !== ':memory:') {
      this.db = new Database(this.path);
    }
  }

  async onShutdown() {
    this.db?.close();
  }

  /**
   * Open a SQLite database
   * @param path Database file path {@example data.db} or ":memory:" for in-memory
   * @param readonly Open in read-only mode
   */
  async open(params: { path: string; readonly?: boolean }) {
    if (this.db) this.db.close();
    this.db = new Database(params.path, { readonly: params.readonly ?? false });
    return { path: params.path, isMemory: params.path === ':memory:' };
  }

  /**
   * Execute a SELECT query
   * @param sql SQL query {@field textarea} {@example SELECT * FROM users WHERE id = ?}
   * @param params Query parameters for prepared statements
   * @format table
   */
  async query(params: { sql: string; params?: any[] }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    const stmt = this.db.prepare(params.sql);
    return stmt.all(...(params.params ?? []));
  }

  /**
   * Execute a SELECT and return first row
   * @param sql SQL query {@field textarea} {@example SELECT * FROM users WHERE id = ?}
   * @param params Query parameters
   * @format card
   */
  async queryOne(params: { sql: string; params?: any[] }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    const stmt = this.db.prepare(params.sql);
    return stmt.get(...(params.params ?? [])) ?? null;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE
   * @param sql SQL statement {@field textarea} {@example INSERT INTO users (name) VALUES (?)}
   * @param params Statement parameters
   */
  async execute(params: { sql: string; params?: any[] }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    const stmt = this.db.prepare(params.sql);
    const info = stmt.run(...(params.params ?? []));
    return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
  }

  /**
   * Execute multiple statements in a transaction
   * @param statements Array of SQL statements with optional parameters
   */
  async transaction(params: { statements: Array<{ sql: string; params?: any[] }> }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    const results = this.db.transaction((stmts) => {
      return stmts.map((s) => {
        const stmt = this.db!.prepare(s.sql);
        const info = stmt.run(...(s.params ?? []));
        return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
      });
    })(params.statements);
    return results;
  }

  /**
   * List all tables in database
   * @autorun
   * @format table
   */
  async tables() {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    const result = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    return result.map((t: any) => t.name);
  }

  /**
   * Get schema for a table
   * @param table Table name {@example users}
   * @format table
   */
  async schema(params: { table: string }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    return this.db.prepare(`PRAGMA table_info(${params.table})`).all();
  }

  /**
   * Close database connection
   */
  async close() {
    if (!this.db) throw new Error('No database is open');
    this.db.close();
    this.db = null;
  }

  /**
   * Create a backup of the database
   * @param destination Backup file path {@example backup.db}
   */
  async backup(params: { destination: string }) {
    if (!this.db) throw new Error('Database not open. Call open() first.');
    if (this.path === ':memory:') throw new Error('Cannot backup in-memory database');
    const backup = this.db.backup(params.destination);
    backup.step(-1);
    backup.close();
  }

  // ========== TESTS ==========

  private testDbPath = `/tmp/photon-test-${Date.now()}.db`;
  private testTable = `test_${Date.now()}`;

  async testBeforeAll() {
    await this.open({ path: this.testDbPath });
    await this.execute({
      sql: `CREATE TABLE IF NOT EXISTS ${this.testTable} (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)`,
    });
  }

  async testAfterAll() {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      const fs = await import('fs/promises');
      await fs.unlink(this.testDbPath).catch(() => {});
    } catch {}
  }

  async testOpen() {
    if (!this.db) return { skipped: true, reason: 'Database not open' };
    return { passed: true };
  }

  async testTables() {
    if (!this.db) return { skipped: true, reason: 'Database not open' };
    const result = await this.tables();
    if (!Array.isArray(result)) throw new Error('Tables should be array');
    return { passed: true };
  }

  async testInsertQuery() {
    if (!this.db) return { skipped: true, reason: 'Database not open' };
    await this.execute({ sql: `INSERT INTO ${this.testTable} (name, value) VALUES (?, ?)`, params: ['test', 42] });
    const result = await this.query({ sql: `SELECT * FROM ${this.testTable} WHERE name = ?`, params: ['test'] });
    if (!Array.isArray(result) || result.length === 0) throw new Error('Row not found');
    if (result[0].value !== 42) throw new Error('Wrong value');
    return { passed: true };
  }

  async testSchema() {
    if (!this.db) return { skipped: true, reason: 'Database not open' };
    const result = await this.schema({ table: this.testTable });
    if (!Array.isArray(result)) throw new Error('Columns should be array');
    return { passed: true };
  }
}
