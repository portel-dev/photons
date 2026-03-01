/**
 * Spreadsheet — CSV-backed spreadsheet with formulas
 *
 * A spreadsheet engine that works on plain CSV files. Formulas (=SUM, =AVG, etc.)
 * are stored directly in CSV cells and evaluated at runtime. Named instances map
 * to CSV files: `_use('budget')` → `budget.csv` in your spreadsheets folder.
 * Pass a full path to open any CSV: `_use('/path/to/data.csv')`.
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @tags spreadsheet, csv, formulas, data
 * @icon 📊
 * @stateful
 * @dependencies @portel/csv alasql
 * @ui spreadsheet ./ui/spreadsheet.html
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, mkdirSync, statSync, watch as fsWatch, type FSWatcher } from 'fs';
import { CsvEngine, cellToIndex } from '@portel/csv';

interface WatchDef {
  name: string;
  query: string;
  action?: string;
  actionParams?: Record<string, any>;
  once: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export default class Spreadsheet {
  private engine = new CsvEngine();
  private loaded = false;

  // File watcher state
  private _watcher: FSWatcher | null = null;
  private _lastFileSize = 0;
  private _watchDebounce: ReturnType<typeof setTimeout> | null = null;

  declare emit: (data: any) => void;
  declare call: (target: string, params?: Record<string, any>, options?: { instance?: string }) => Promise<any>;
  declare instanceName: string;

  // SQL watch state
  private _watches: Map<string, WatchDef> = new Map();
  private _watcherAutoStarted = false;

  protected settings = {
    /** @property Directory where spreadsheet CSV files are stored */
    folder: path.join(os.homedir(), 'Documents', 'Spreadsheets'),
    /** @property Save format row: true (always), false (never), auto (if original had one or formatting was customized) */
    formatting: 'auto' as 'auto' | 'true' | 'false',
  };

  // --- File resolution ---

  private get defaultFolder(): string {
    return this.settings?.folder || path.join(os.homedir(), 'Documents', 'Spreadsheets');
  }

  private get csvPath(): string {
    const name = this.instanceName || 'default';

    if (path.isAbsolute(name)) {
      return name.endsWith('.csv') ? name : name + '.csv';
    }

    if (name.includes('/') || name.includes('\\')) {
      const resolved = path.resolve(name);
      return resolved.endsWith('.csv') ? resolved : resolved + '.csv';
    }

    const dir = this.defaultFolder;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return path.join(dir, name.endsWith('.csv') ? name : name + '.csv');
  }

  // --- Persistence ---

  private async load(): Promise<void> {
    if (this.loaded) return;

    const csvPath = this.csvPath;
    if (existsSync(csvPath)) {
      const csv = await fs.readFile(csvPath, 'utf-8');
      if (csv.trim().length > 0) {
        this.engine = CsvEngine.fromCSV(csv);
        this.loaded = true;
        return;
      }
    }

    this.engine = new CsvEngine();
    this.loaded = true;
  }

  private async save(): Promise<void> {
    const dir = path.dirname(this.csvPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const formatRow = this.shouldWriteFormatRow();
    const csv = this.engine.toCSV({ formatRow });
    await fs.writeFile(this.csvPath, csv, 'utf-8');
  }

  private shouldWriteFormatRow(): boolean {
    const fmt = this.settings?.formatting || 'auto';
    if (fmt === 'true') return true;
    if (fmt === 'false') return false;
    return this.engine.getHasFormatRow() || this.engine.getMetaCustomized();
  }

  // --- Response formatting ---

  private buildResponse(message: string): Record<string, any> {
    const snap = this.engine.snapshot(message);
    return { ...snap, file: this.csvPath };
  }

  // --- Tool methods ---

  /**
   * Open spreadsheet UI
   *
   * @ui spreadsheet
   * @autorun
   */
  async main() {
    await this.load();
    return this.buildResponse(`Opened ${path.basename(this.csvPath)}`);
  }

  /**
   * View the spreadsheet grid
   *
   * Returns the full spreadsheet or a specific range as a formatted table.
   *
   * @param range Optional cell range to view (e.g., "A1:D10")
   * @format table
   */
  async view(params?: { range?: string }) {
    await this.load();

    if (params?.range) {
      return {
        ...this.buildResponse(`Viewing range ${params.range}`),
        table: this.engine.toTable(params.range),
      };
    }

    return this.buildResponse(path.basename(this.csvPath));
  }

  /**
   * Get a cell value
   *
   * Returns the evaluated value and raw content (formula if any) for a single cell.
   *
   * @param cell Cell reference in A1 notation (e.g., "B3")
   */
  async get(params: { cell: string }) {
    await this.load();

    const { row, col } = cellToIndex(params.cell);

    if (row >= this.engine.rowCount || col >= this.engine.colCount) {
      return { cell: params.cell, value: '', raw: '', message: 'Cell is empty' };
    }

    const raw = this.engine.getRawCell(row, col);
    const value = this.engine.evaluate(row, col);

    return {
      cell: params.cell,
      value,
      raw,
      message: raw.startsWith('=')
        ? `${params.cell} = ${value} (${raw})`
        : `${params.cell} = ${value || '(empty)'}`,
    };
  }

  /**
   * Set a cell value or formula
   *
   * Set a cell to a plain value or a formula starting with "=".
   * Formulas support: SUM, AVG, MAX, MIN, COUNT, IF, LEN, ABS, ROUND, CONCAT.
   * Cell references use A1 notation. Ranges use A1:B2 notation.
   *
   * @param cell Cell reference in A1 notation (e.g., "B3")
   * @param value Value or formula (e.g., "42" or "=SUM(A1:A5)")
   * @example set({ cell: 'B3', value: '=SUM(B1:B2)' })
   */
  async set(params: { cell: string; value: string }) {
    await this.load();

    const { row, col } = cellToIndex(params.cell);

    const oldRaw = this.engine.getRawCell(row, col);
    const oldDisplay = oldRaw.startsWith('=') ? this.engine.evaluate(row, col) : oldRaw;

    this.engine.set(params.cell, String(params.value));
    await this.save();

    const evaluated = this.engine.evaluate(row, col);
    const msg = oldRaw
      ? `Set ${params.cell} = ${evaluated} (was: ${oldDisplay})`
      : `Set ${params.cell} = ${evaluated}`;

    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Add a row of data
   *
   * Add a new row to the bottom of the spreadsheet. Pass column values by header name.
   *
   * @param values Key-value pairs mapping column names to values (e.g., {"Name": "Alice", "Age": "30"})
   * @example add({ values: { Name: 'Alice', Age: '30' } })
   */
  async add(params: { values: Record<string, string> }) {
    await this.load();

    const rowNum = this.engine.add(params.values);
    await this.save();

    const msg = `Added row ${rowNum}`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Remove a row
   *
   * @param row Row number to remove (1-indexed)
   */
  async remove(params: { row: number }) {
    await this.load();

    this.engine.remove(params.row);
    await this.save();

    const msg = `Removed row ${params.row}`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Update fields in a row
   *
   * @param row Row number to update (1-indexed)
   * @param values Key-value pairs mapping column names to new values
   * @example update({ row: 3, values: { Age: '42' } })
   */
  async update(params: { row: number; values: Record<string, string> }) {
    await this.load();

    const changes = this.engine.update(params.row, params.values);
    await this.save();

    const msg = `Updated row ${params.row}: ${changes.join(', ')}`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Query rows by condition
   *
   * Filter rows where a column matches a condition. Supports: =, !=, >, <, >=, <=, contains.
   *
   * @param where Condition string (e.g., "Age > 25", "Name contains Ali")
   * @param limit Max rows to return
   * @example query({ where: 'Age > 25' })
   */
  async query(params: { where: string; limit?: number }) {
    await this.load();
    return this.engine.query(params.where, params.limit);
  }

  /**
   * Sort by column
   *
   * Sorts all data rows by the specified column.
   *
   * @param column Column name or letter to sort by
   * @param order Sort order: "asc" or "desc" (default: "asc")
   * @example sort({ column: 'Age', order: 'desc' })
   */
  async sort(params: { column: string; order?: string }) {
    await this.load();

    this.engine.sort(params.column, params.order);
    await this.save();

    const msg = `Sorted by ${params.column} (${params.order || 'asc'})`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Fill a range with values or a pattern
   *
   * @param range Cell range (e.g., "A1:A10")
   * @param pattern Comma-separated values to repeat (e.g., "1,2,3")
   * @example fill({ range: 'A1:A10', pattern: '1,2,3' })
   */
  async fill(params: { range: string; pattern: string }) {
    await this.load();

    this.engine.fill(params.range, params.pattern);
    await this.save();

    const msg = `Filled ${params.range} with pattern [${params.pattern}]`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Show column headers and detected types
   *
   * @format table
   */
  async schema() {
    await this.load();

    const schema = this.engine.schema();
    const table = '| Column | Type | Non-empty | Total |\n|--------|------|-----------|-------|\n' +
      schema.map(s => `| ${s.column} | ${s.type} | ${s.nonEmpty} | ${s.total} |`).join('\n');

    return {
      table,
      schema,
      headers: this.engine.getHeaders(),
      message: `${this.engine.colCount} columns, ${this.engine.rowCount} rows`,
      file: this.csvPath,
    };
  }

  /**
   * Resize the spreadsheet grid
   *
   * @param rows New number of rows
   * @param cols New number of columns
   */
  async resize(params: { rows?: number; cols?: number }) {
    await this.load();

    this.engine.resize(params.rows, params.cols);
    await this.save();

    return this.buildResponse(`Resized to ${this.engine.rowCount} rows x ${this.engine.colCount} cols`);
  }

  /**
   * Import CSV data
   *
   * Load data from a CSV file path or raw CSV text. The first row is treated as headers.
   *
   * @param file Path to a CSV file to import
   * @param csv Raw CSV text to import (alternative to file)
   * @example ingest({ csv: 'Name,Age\\nAlice,30\\nBob,25' })
   */
  async ingest(params: { file?: string; csv?: string }) {
    let csvText: string;

    if (params.file) {
      csvText = await fs.readFile(params.file, 'utf-8');
    } else if (params.csv) {
      csvText = params.csv;
    } else {
      throw new Error('Provide either "file" path or "csv" text');
    }

    this.engine = CsvEngine.fromCSV(csvText);
    this.loaded = true;

    await this.save();

    const msg = `Imported ${this.engine.rowCount} rows x ${this.engine.colCount} cols`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Export as CSV
   *
   * Returns the raw CSV content (with formulas preserved), or saves to a file.
   *
   * @param file Optional file path to save CSV to
   */
  async dump(params?: { file?: string }) {
    await this.load();

    const csvText = this.engine.toCSV({ formatRow: this.shouldWriteFormatRow() });

    if (params?.file) {
      const dir = path.dirname(params.file);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      await fs.writeFile(params.file, csvText, 'utf-8');
      return { message: `Exported to ${params.file}`, file: params.file };
    }

    const lineCount = csvText.split('\n').filter(l => l.length > 0).length - 1;
    return { csv: csvText, message: `CSV export (${lineCount} rows)` };
  }

  /**
   * Clear cells
   *
   * Clear all cells or a specific range.
   *
   * @param range Optional range to clear (e.g., "B:B" or "A1:C5"). Clears all if omitted.
   */
  async clear(params?: { range?: string }) {
    await this.load();

    this.engine.clear(params?.range);
    await this.save();

    const msg = params?.range ? `Cleared range ${params.range}` : 'Cleared all cells';
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Rename a column header
   *
   * @param column Column letter or current header name
   * @param name New header name
   * @example rename({ column: 'A', name: 'Product' })
   */
  async rename(params: { column: string; name: string }) {
    await this.load();

    const old = this.engine.rename(params.column, params.name);
    await this.save();

    return this.buildResponse(`Renamed column: "${old}" -> "${params.name}"`);
  }

  /**
   * Set column formatting
   *
   * Set alignment, type, or width for a column. This creates a format row in the CSV
   * when formatting is set to "auto" (default).
   *
   * @param column Column letter or header name
   * @param align Alignment: "left", "right", or "center"
   * @param type Column type: "text", "number", "currency", "percent", "date", "bool", "select", "formula", "markdown", "longtext"
   * @param width Column width in pixels
   * @param wrap Enable text wrapping for this column
   * @example format({ column: 'B', align: 'right', type: 'number' })
   * @example format({ column: 'C', type: 'markdown', wrap: true })
   */
  async format(params: { column: string; align?: string; type?: string; width?: number; wrap?: boolean }) {
    await this.load();

    this.engine.format(params.column, {
      align: params.align,
      type: params.type,
      width: params.width,
      wrap: params.wrap,
    });
    await this.save();

    const changes = [
      params.align && `align=${params.align}`,
      params.type && `type=${params.type}`,
      params.width !== undefined && `width=${params.width}`,
      params.wrap !== undefined && `wrap=${params.wrap}`,
    ].filter(Boolean).join(', ');

    const msg = `Formatted ${params.column}: ${changes}`;
    await this._emitAndWatch(msg);
    return this.buildResponse(msg);
  }

  /**
   * Watch the CSV file for appended rows
   *
   * Starts watching the underlying CSV file. When external processes append rows,
   * the spreadsheet updates in real-time. Use `unwatch` to stop.
   */
  async tail() {
    await this.load();

    if (this._watcher) {
      return { message: `Already watching ${path.basename(this.csvPath)}`, file: this.csvPath, watching: true };
    }

    this._startFileWatching();
    this._watcherAutoStarted = false;

    const msg = `Watching ${path.basename(this.csvPath)} for changes`;
    return { ...this.buildResponse(msg), watching: true };
  }

  /**
   * Stop watching the CSV file
   *
   * Stops the file watcher started by `tail`.
   */
  async untail() {
    this._watcherAutoStarted = false;
    this._stopFileWatching();
    return { message: 'Stopped watching', watching: false };
  }

  /**
   * Append rows to the spreadsheet
   *
   * Batch-append one or more rows. Each row is a list of values matching
   * the column order, or a key-value object mapping column names to values.
   * Emits after all rows are added so charts and UIs update once.
   *
   * @param rows Array of rows to append. Each row is either an array of values or a {column: value} object.
   * @example push({ rows: [["Alice", "30"], ["Bob", "25"]] })
   * @example push({ rows: [{"Name": "Alice", "Age": "30"}] })
   */
  async push(params: { rows: (string[] | Record<string, string>)[] }) {
    await this.load();

    const added = this.engine.push(params.rows);
    await this.save();

    const msg = `Pushed ${added} row(s) (${this.engine.rowCount} total)`;
    await this._emitAndWatch(msg, { autoScroll: true });
    return this.buildResponse(msg);
  }

  /** Handle file change detected by watcher */
  private async _onFileChanged(): Promise<void> {
    try {
      const csvPath = this.csvPath;
      if (!existsSync(csvPath)) return;

      const currentSize = statSync(csvPath).size;
      if (currentSize <= this._lastFileSize) {
        if (currentSize < this._lastFileSize) {
          this.loaded = false;
          await this.load();
          this._lastFileSize = currentSize;
          await this._emitAndWatch('File reloaded (truncated)', { autoScroll: false });
        }
        return;
      }

      // Read only the new bytes appended since last check
      const fd = await fs.open(csvPath, 'r');
      const newBytes = Buffer.alloc(currentSize - this._lastFileSize);
      await fd.read(newBytes, 0, newBytes.length, this._lastFileSize);
      await fd.close();
      this._lastFileSize = currentSize;

      const newText = newBytes.toString('utf-8');
      const newLines = newText.split('\n').filter(l => l.trim().length > 0);

      if (newLines.length === 0) return;

      const added = this.engine.appendCSVLines(newLines);

      if (added > 0) {
        const msg = `+${added} row(s) from file (${this.engine.rowCount} total)`;
        await this._emitAndWatch(msg, { autoScroll: true });
      }
    } catch (err) {
      console.error('File watch handler error:', err);
    }
  }

  // --- SQL & Watch tools ---

  /**
   * Run a SQL query on the spreadsheet data
   *
   * Query the spreadsheet using SQL syntax. Table name is `data`.
   * Column names with spaces or special characters need double quotes.
   *
   * @param query SQL query string (e.g., "SELECT * FROM data WHERE Age > 25")
   * @example sql({ query: "SELECT Name, Age FROM data WHERE Age > 25 ORDER BY Age DESC" })
   * @example sql({ query: "SELECT COUNT(*) as total FROM data" })
   */
  async sql(params: { query: string }) {
    await this.load();
    return this.engine.sql(params.query);
  }

  /**
   * Create a live SQL watch
   *
   * Registers a named SQL query that re-runs after every data change.
   * When the query returns rows, an alert is emitted. Optionally triggers
   * a cross-photon action (e.g., "slack.send").
   *
   * @param name Unique watch name (e.g., "price-alert")
   * @param query SQL query — fires when it returns rows (e.g., "SELECT * FROM data WHERE Price < 50")
   * @param action Optional cross-photon call target (e.g., "slack.send")
   * @param actionParams Optional parameters passed to the action
   * @param once If true, auto-removes after first trigger
   * @example watch({ name: "big-orders", query: "SELECT * FROM data WHERE Amount > 1000" })
   * @example watch({ name: "notify", query: "SELECT * FROM data WHERE Status = 'critical'", action: "slack.send", actionParams: { text: "Critical row found!" }, once: true })
   */
  async watch(params: {
    name: string;
    query: string;
    action?: string;
    actionParams?: Record<string, any>;
    once?: boolean;
  }) {
    await this.load();

    const def: WatchDef = {
      name: params.name,
      query: params.query,
      action: params.action,
      actionParams: params.actionParams,
      once: params.once ?? false,
      triggerCount: 0,
    };

    this._watches.set(params.name, def);

    if (!this._watcher) {
      this._startFileWatching();
      this._watcherAutoStarted = true;
    }

    // Run query immediately to check current state
    let currentMatches = 0;
    try {
      const result = this.engine.sql(params.query);
      currentMatches = Array.isArray(result.result) ? result.result.length : 0;
    } catch { /* validation happens on first real run */ }

    return {
      message: `Watch "${params.name}" created${currentMatches > 0 ? ` (${currentMatches} rows match now)` : ''}`,
      watch: params.name,
      currentMatches,
      watches: this._watches.size,
    };
  }

  /**
   * Remove a live SQL watch
   *
   * @param name Watch name to remove
   */
  async unwatch(params: { name: string }) {
    const existed = this._watches.delete(params.name);

    if (this._watches.size === 0 && this._watcherAutoStarted) {
      this._stopFileWatching();
      this._watcherAutoStarted = false;
    }

    return {
      message: existed ? `Removed watch "${params.name}"` : `Watch "${params.name}" not found`,
      watches: this._watches.size,
    };
  }

  /**
   * List active SQL watches
   *
   * Shows all registered watches with their trigger counts and status.
   */
  async watches() {
    const list = Array.from(this._watches.values()).map(w => ({
      name: w.name,
      query: w.query,
      action: w.action,
      once: w.once,
      triggerCount: w.triggerCount,
      lastTriggered: w.lastTriggered || null,
    }));

    return {
      watches: list,
      count: list.length,
      message: list.length > 0
        ? `${list.length} active watch(es)`
        : 'No active watches',
    };
  }

  // --- File watching helpers ---

  private _startFileWatching(): void {
    if (this._watcher) return;

    const csvPath = this.csvPath;
    if (!existsSync(csvPath)) return;

    this._lastFileSize = statSync(csvPath).size;
    this._watcher = fsWatch(csvPath, () => {
      if (this._watchDebounce) clearTimeout(this._watchDebounce);
      this._watchDebounce = setTimeout(() => this._onFileChanged(), 200);
    });
  }

  private _stopFileWatching(): void {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
      if (this._watchDebounce) {
        clearTimeout(this._watchDebounce);
        this._watchDebounce = null;
      }
    }
  }

  // --- Emit + watch pipeline ---

  private async _emitAndWatch(msg: string, opts: Record<string, any> = {}): Promise<void> {
    this.emit({ emit: 'data', ...this.buildResponse(msg), ...opts });
    await this._rerunWatches();
  }

  private async _rerunWatches(): Promise<void> {
    if (this._watches.size === 0) return;

    for (const [name, watch] of this._watches) {
      try {
        const result = this.engine.sql(watch.query);
        if (Array.isArray(result.result) && result.result.length > 0) {
          watch.triggerCount++;
          watch.lastTriggered = new Date().toISOString();
          this.emit({ emit: 'alert', watch: name, rows: result.result, count: result.result.length });

          if (watch.action && this.call) {
            try {
              await this.call(watch.action, { ...watch.actionParams, _matchedRows: result.result });
            } catch (err) {
              console.error(`Watch "${name}" action failed:`, err);
            }
          }

          if (watch.once) this._watches.delete(name);
        }
      } catch (err) {
        console.error(`Watch "${name}" query error:`, err);
      }
    }
  }
}
