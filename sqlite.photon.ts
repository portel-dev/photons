/**
 * SQLite Photon MCP - SQLite database operations
 *
 * Provides SQLite database utilities: query, execute, insert, update, delete, and schema operations.
 * Supports both in-memory and file-based databases.
 *
 * Example: query("SELECT * FROM users WHERE id = ?", [1])
 * Example: open("./mydb.sqlite")
 * Example: schema("users")
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies better-sqlite3@^11.0.0
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';

export default class SQLite {
  private db: Database.Database | null = null;
  private dbPath: string = ':memory:';

  constructor(private path?: string) {
    if (path) {
      this.dbPath = path;
    }
  }

  async onInitialize() {
    // Auto-open database if path was provided in constructor
    if (this.dbPath !== ':memory:' || this.path) {
      this.db = new Database(this.dbPath, {
        readonly: false,
        fileMustExist: false,
      });
      console.error(`[sqlite] ✅ Database opened: ${this.dbPath}`);
    }
  }

  /**
   * Open a SQLite database
   * @param path Database file path (use ":memory:" for in-memory database)
   * @param readonly Open in readonly mode (default: false)
   * @example open("./mydb.sqlite")
   * @example open(":memory:")
   * @example open("./mydb.sqlite", true)
   * @example open({ path: "./mydb.sqlite", readonly: true })
   */
  async open(params: { path: string; readonly?: boolean } | string, readonly?: boolean) {
    // Support both open("path", readonly) and open({ path, readonly })
    const dbPath = typeof params === 'string' ? params : params.path;
    const isReadonly = typeof params === 'string' ? (readonly || false) : (params.readonly || false);

    try {
      if (this.db) {
        this.db.close();
      }

      this.dbPath = dbPath;
      this.db = new Database(dbPath, {
        readonly: isReadonly,
        fileMustExist: false,
      });

      return {
        success: true,
        message: `Database opened: ${dbPath}`,
        isMemory: dbPath === ':memory:',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a SELECT query
   * @param sql SQL query string
   * @param params Query parameters (for prepared statements)
   * @example query("SELECT * FROM users")
   * @example query("SELECT * FROM users WHERE id = ?", [1])
   * @example query({ sql: "SELECT * FROM users WHERE id = ?", params: [1] })
   */
  async query(params: { sql: string; params?: any[] } | string, queryParams?: any[]) {
    // Support both query("sql", params) and query({ sql, params })
    const sql = typeof params === 'string' ? params : params.sql;
    const sqlParams = typeof params === 'string' ? queryParams : params.params;

    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...(sqlParams || []));

      return {
        success: true,
        rows,
        count: rows.length,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a single SELECT query and return first row
   * @param sql SQL query string
   * @param params Query parameters (for prepared statements)
   * @example queryOne("SELECT * FROM users WHERE id = ?", [1])
   * @example queryOne({ sql: "SELECT * FROM users WHERE id = ?", params: [1] })
   */
  async queryOne(params: { sql: string; params?: any[] } | string, queryParams?: any[]) {
    // Support both queryOne("sql", params) and queryOne({ sql, params })
    const sql = typeof params === 'string' ? params : params.sql;
    const sqlParams = typeof params === 'string' ? queryParams : params.params;

    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const stmt = this.db.prepare(sql);
      const row = stmt.get(...(sqlParams || []));

      return {
        success: true,
        row: row || null,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   * @param sql SQL statement string
   * @param params Statement parameters (for prepared statements)
   * @example execute("INSERT INTO users (name, email) VALUES (?, ?)", ["John", "john@example.com"])
   * @example execute("UPDATE users SET name = ? WHERE id = ?", ["Jane", 1])
   * @example execute({ sql: "DELETE FROM users WHERE id = ?", params: [1] })
   */
  async execute(params: { sql: string; params?: any[] } | string, executeParams?: any[]) {
    // Support both execute("sql", params) and execute({ sql, params })
    const sql = typeof params === 'string' ? params : params.sql;
    const sqlParams = typeof params === 'string' ? executeParams : params.params;

    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const stmt = this.db.prepare(sql);
      const info = stmt.run(...(sqlParams || []));

      return {
        success: true,
        changes: info.changes,
        lastInsertRowid: info.lastInsertRowid,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute multiple SQL statements in a transaction
   * @param statements Array of SQL statements with optional parameters
   */
  async transaction(params: { statements: Array<{ sql: string; params?: any[] }> }) {
    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const executeAll = this.db.transaction((statements: Array<{ sql: string; params?: any[] }>) => {
        const results = [];
        for (const stmt of statements) {
          const prepared = this.db!.prepare(stmt.sql);
          const info = prepared.run(...(stmt.params || []));
          results.push({
            changes: info.changes,
            lastInsertRowid: info.lastInsertRowid,
          });
        }
        return results;
      });

      const results = executeAll(params.statements);

      return {
        success: true,
        message: 'Transaction completed',
        results,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all tables in the database
   */
  async tables() {
    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const tables = this.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all();

      return {
        success: true,
        tables: tables.map((t: any) => t.name),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get schema information for a table
   * @param table Table name
   * @example schema("users")
   * @example schema({ table: "users" })
   */
  async schema(params: { table: string } | string) {
    // Support both schema("table") and schema({ table })
    const table = typeof params === 'string' ? params : params.table;

    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    try {
      const columns = this.db.prepare(`PRAGMA table_info(${table})`).all();

      return {
        success: true,
        table,
        columns,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    if (!this.db) {
      return { success: false, error: 'No database is open' };
    }

    try {
      this.db.close();
      this.db = null;

      return {
        success: true,
        message: 'Database closed',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a backup of the database
   * @param destination Path to backup file
   * @example backup("./mydb.backup.sqlite")
   * @example backup({ destination: "./mydb.backup.sqlite" })
   */
  async backup(params: { destination: string } | string) {
    // Support both backup("destination") and backup({ destination })
    const destination = typeof params === 'string' ? params : params.destination;

    if (!this.db) {
      return { success: false, error: 'No database open. Use open() first.' };
    }

    if (this.dbPath === ':memory:') {
      return { success: false, error: 'Cannot backup in-memory database' };
    }

    try {
      const backup = this.db.backup(destination);

      return new Promise((resolve) => {
        backup.step(-1);
        backup.close();
        resolve({
          success: true,
          message: `Database backed up to ${destination}`,
        });
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async onShutdown() {
    if (this.db) {
      this.db.close();
      console.error('[sqlite] Database connection closed');
    }
  }
}
