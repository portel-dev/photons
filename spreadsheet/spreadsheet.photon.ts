/**
 * Spreadsheet — CSV-backed spreadsheet with formulas
 *
 * A spreadsheet engine that persists data as CSV files. Supports cell references,
 * formulas (SUM, AVG, MAX, MIN, COUNT, IF), sorting, and filtering. Use named
 * instances for separate spreadsheets: `_use('budget')`, `_use('inventory')`.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags spreadsheet, csv, formulas, data
 * @icon 📊
 * @stateful
 * @ui spreadsheet ./ui/spreadsheet.html
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, mkdirSync } from 'fs';

interface SpreadsheetState {
  data: string[][];
  formulas: string[][];
  headers: string[];
  rowCount: number;
  colCount: number;
}

export default class Spreadsheet {
  private data: string[][] = [];
  private formulas: string[][] = [];
  private headers: string[] = [];
  private rowCount = 20;
  private colCount = 10;
  private loaded = false;

  declare emit: (data: any) => void;
  declare instanceName: string;

  // --- Persistence ---

  private get stateDir(): string {
    const dir = path.join(os.homedir(), '.photon', 'state', 'spreadsheet');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  private get instanceId(): string {
    return this.instanceName || 'default';
  }

  private get csvPath(): string {
    return path.join(this.stateDir, `${this.instanceId}.csv`);
  }

  private get formulasPath(): string {
    return path.join(this.stateDir, `${this.instanceId}.formulas.json`);
  }

  private async load(): Promise<void> {
    if (this.loaded) return;

    if (existsSync(this.csvPath)) {
      const csv = await fs.readFile(this.csvPath, 'utf-8');
      const lines = csv.split('\n').filter(l => l.length > 0);

      if (lines.length > 0) {
        this.headers = this.parseCSVLine(lines[0]);
        this.colCount = this.headers.length;
        this.rowCount = lines.length - 1;

        this.data = [];
        this.formulas = [];
        for (let i = 1; i < lines.length; i++) {
          const row = this.parseCSVLine(lines[i]);
          while (row.length < this.colCount) row.push('');
          this.data.push(row);
          this.formulas.push(new Array(this.colCount).fill(''));
        }

        // Load formulas sidecar
        if (existsSync(this.formulasPath)) {
          try {
            const raw = await fs.readFile(this.formulasPath, 'utf-8');
            const saved: Record<string, string> = JSON.parse(raw);
            for (const [cell, formula] of Object.entries(saved)) {
              const { row, col } = this.cellToIndex(cell);
              if (row < this.rowCount && col < this.colCount) {
                this.formulas[row][col] = formula;
              }
            }
          } catch {}
        }

        this.recalculateAll();
        this.loaded = true;
        return;
      }
    }

    // Initialize empty grid
    this.initEmpty();
    this.loaded = true;
  }

  private initEmpty(): void {
    this.headers = [];
    for (let i = 0; i < this.colCount; i++) {
      this.headers.push(this.numberToColumnName(i));
    }
    this.data = [];
    this.formulas = [];
    for (let i = 0; i < this.rowCount; i++) {
      this.data.push(new Array(this.colCount).fill(''));
      this.formulas.push(new Array(this.colCount).fill(''));
    }
  }

  private async save(): Promise<void> {
    // Trim trailing empty rows
    let lastDataRow = -1;
    for (let r = this.data.length - 1; r >= 0; r--) {
      if (this.data[r].some(v => v !== '')) {
        lastDataRow = r;
        break;
      }
    }

    const rows = this.data.slice(0, lastDataRow + 1);
    const csvLines = [this.headers.map(h => this.escapeCSV(h)).join(',')];
    for (const row of rows) {
      csvLines.push(row.map(v => this.escapeCSV(String(v))).join(','));
    }
    await fs.writeFile(this.csvPath, csvLines.join('\n') + '\n', 'utf-8');

    // Save formulas sidecar
    const formulaMap: Record<string, string> = {};
    for (let r = 0; r < this.formulas.length; r++) {
      for (let c = 0; c < this.formulas[r].length; c++) {
        if (this.formulas[r][c]) {
          const cell = this.headers[c] + (r + 1);
          formulaMap[cell] = this.formulas[r][c];
        }
      }
    }
    if (Object.keys(formulaMap).length > 0) {
      await fs.writeFile(this.formulasPath, JSON.stringify(formulaMap, null, 2), 'utf-8');
    } else if (existsSync(this.formulasPath)) {
      await fs.unlink(this.formulasPath);
    }
  }

  // --- CSV helpers ---

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // --- Cell reference helpers ---

  private numberToColumnName(num: number): string {
    let result = '';
    num++;
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  private columnNameToNumber(name: string): number {
    let result = 0;
    for (let i = 0; i < name.length; i++) {
      result = result * 26 + (name.toUpperCase().charCodeAt(i) - 64);
    }
    return result - 1;
  }

  private cellToIndex(cell: string): { row: number; col: number } {
    const match = cell.match(/^([A-Za-z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell reference: ${cell}`);
    return {
      col: this.columnNameToNumber(match[1]),
      row: parseInt(match[2]) - 1,
    };
  }

  private rangeToIndices(range: string): { startRow: number; startCol: number; endRow: number; endCol: number } {
    // Handle column-only ranges like "B:B"
    const colMatch = range.match(/^([A-Za-z]+):([A-Za-z]+)$/);
    if (colMatch) {
      return {
        startCol: this.columnNameToNumber(colMatch[1]),
        startRow: 0,
        endCol: this.columnNameToNumber(colMatch[2]),
        endRow: this.rowCount - 1,
      };
    }

    const parts = range.split(':');
    if (parts.length !== 2) throw new Error(`Invalid range: ${range}`);
    const start = this.cellToIndex(parts[0]);
    const end = this.cellToIndex(parts[1]);
    return {
      startRow: start.row,
      startCol: start.col,
      endRow: end.row,
      endCol: end.col,
    };
  }

  private resolveColumnIndex(name: string): number {
    // Try as header name first (e.g., "Name", "Age")
    const headerIdx = this.headers.indexOf(name);
    if (headerIdx !== -1) return headerIdx;
    // Try case-insensitive header match
    const lowerName = name.toLowerCase();
    const ciIdx = this.headers.findIndex(h => h.toLowerCase() === lowerName);
    if (ciIdx !== -1) return ciIdx;
    // Fall back to column letter (e.g., "A", "B")
    return this.columnNameToNumber(name);
  }

  private ensureCapacity(row: number, col: number): void {
    while (this.rowCount <= row) {
      this.data.push(new Array(this.colCount).fill(''));
      this.formulas.push(new Array(this.colCount).fill(''));
      this.rowCount++;
    }
    if (col >= this.colCount) {
      const newColCount = col + 1;
      for (let r = 0; r < this.rowCount; r++) {
        while (this.data[r].length < newColCount) this.data[r].push('');
        while (this.formulas[r].length < newColCount) this.formulas[r].push('');
      }
      while (this.headers.length < newColCount) {
        this.headers.push(this.numberToColumnName(this.headers.length));
      }
      this.colCount = newColCount;
    }
  }

  // --- Formula engine (ported from HTML prototype) ---

  private evaluateFormula(formula: string, currentRow: number, currentCol: number): string | number {
    try {
      let processed = formula.trim();

      const functionNames = ['SUM', 'AVG', 'AVERAGE', 'MAX', 'MIN', 'COUNT', 'IF', 'LEN', 'CONCAT', 'ABS', 'ROUND'];

      // Step 1: Replace cell range references FIRST (A1:B2 format) before individual refs
      processed = processed.replace(/([A-Z]+)(\d+):([A-Z]+)(\d+)/gi, (match, col, row, endCol, endRow) => {
        return this.getRangeValue(col.toUpperCase(), parseInt(row), endCol.toUpperCase(), parseInt(endRow));
      });

      // Step 2: Replace single cell references (A1 format) and header-based references
      processed = processed.replace(/([A-Za-z_][A-Za-z0-9_]*)(\d+)/g, (match, header, rowNum) => {
        if (functionNames.includes(header.toUpperCase())) return match;

        // Try as column letter reference first (A1 notation)
        const colIndex = this.columnNameToNumber(header.toUpperCase());
        const rowIndex = parseInt(rowNum) - 1;
        if (header === header.toUpperCase() && colIndex >= 0 && colIndex < this.colCount &&
            rowIndex >= 0 && rowIndex < this.rowCount) {
          const value = this.data[rowIndex][colIndex];
          if (value === '' || value === undefined) return '0';
          return isNaN(Number(value)) ? `"${value}"` : value;
        }

        // Try as header name reference (e.g., Name2)
        const headerIdx = this.headers.indexOf(header);
        if (headerIdx !== -1 && parseInt(rowNum) > 0 && parseInt(rowNum) <= this.rowCount) {
          const value = this.data[parseInt(rowNum) - 1][headerIdx];
          if (value === '' || value === undefined) return '0';
          return isNaN(Number(value)) ? `"${value}"` : value;
        }

        return match; // Don't replace unknown patterns with 0
      });

      // Evaluate spreadsheet functions
      processed = this.evaluateFunctions(processed);

      // Safe evaluation
      const result = this.safeEval(processed);
      if (typeof result === 'number' && !isNaN(result)) {
        return Math.round(result * 100000000) / 100000000;
      }
      return result;
    } catch {
      return '#ERROR';
    }
  }

  private getRangeValue(startCol: string, startRow: number, endCol: string, endRow: number): string {
    const startColIndex = this.columnNameToNumber(startCol);
    const endColIndex = this.columnNameToNumber(endCol);
    const startRowIndex = startRow - 1;
    const endRowIndex = endRow - 1;

    const values: number[] = [];
    for (let r = startRowIndex; r <= endRowIndex; r++) {
      for (let c = startColIndex; c <= endColIndex; c++) {
        if (r >= 0 && r < this.rowCount && c >= 0 && c < this.colCount) {
          const val = parseFloat(this.data[r][c] as string);
          if (!isNaN(val)) values.push(val);
        }
      }
    }
    return `[${values.join(',')}]`;
  }

  private evaluateFunctions(formula: string): string {
    formula = formula.replace(/SUM\(([^)]+)\)/gi, (_match, range) => {
      const values = this.parseRangeValues(range);
      return String(values.reduce((a, b) => a + b, 0));
    });

    formula = formula.replace(/(?:AVG|AVERAGE)\(([^)]+)\)/gi, (_match, range) => {
      const values = this.parseRangeValues(range);
      return String(values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
    });

    formula = formula.replace(/MAX\(([^)]+)\)/gi, (_match, range) => {
      const values = this.parseRangeValues(range);
      return String(values.length ? Math.max(...values) : 0);
    });

    formula = formula.replace(/MIN\(([^)]+)\)/gi, (_match, range) => {
      const values = this.parseRangeValues(range);
      return String(values.length ? Math.min(...values) : 0);
    });

    formula = formula.replace(/COUNT\(([^)]+)\)/gi, (_match, range) => {
      const values = this.parseRangeValues(range);
      return String(values.length);
    });

    formula = formula.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/gi, (_match, condition, trueVal, falseVal) => {
      const cond = this.safeEval(condition);
      return cond ? trueVal.trim() : falseVal.trim();
    });

    formula = formula.replace(/LEN\(([^)]+)\)/gi, (_match, arg) => {
      // Handle quoted strings directly without safeEval
      const trimmed = arg.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return String(trimmed.slice(1, -1).length);
      }
      const val = String(this.safeEval(trimmed));
      return String(val.replace(/"/g, '').length);
    });

    formula = formula.replace(/ABS\(([^)]+)\)/gi, (_match, arg) => {
      return String(Math.abs(Number(this.safeEval(arg))));
    });

    formula = formula.replace(/ROUND\(([^,]+)(?:,([^)]+))?\)/gi, (_match, arg, decimals) => {
      const val = Number(this.safeEval(arg));
      const dec = decimals ? Number(this.safeEval(decimals)) : 0;
      return String(Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec));
    });

    formula = formula.replace(/CONCAT\(([^)]+)\)/gi, (_match, args) => {
      const parts = args.split(',').map((a: string) => {
        const trimmed = a.trim();
        const evaled = this.safeEval(trimmed);
        return String(evaled).replace(/"/g, '');
      });
      return `"${parts.join('')}"`;
    });

    return formula;
  }

  private parseRangeValues(range: string): number[] {
    if (range.startsWith('[') && range.endsWith(']')) {
      const content = range.slice(1, -1);
      if (!content) return [];
      return content.split(',').filter(x => x !== '').map(Number).filter(n => !isNaN(n));
    }
    const num = parseFloat(range);
    if (!isNaN(num)) return [num];
    return [];
  }

  private safeEval(expression: string): any {
    const sanitized = String(expression)
      .replace(/[^0-9+\-*/().,[\]<>!=\s&|"]/g, '')
      .replace(/&&/g, '&&')
      .replace(/\|\|/g, '||');
    try {
      return new Function('return ' + sanitized)();
    } catch {
      return '#ERROR';
    }
  }

  private recalculateAll(): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        if (this.formulas[row] && this.formulas[row][col]) {
          this.data[row][col] = String(this.evaluateFormula(this.formulas[row][col].substring(1), row, col));
        }
      }
    }
  }

  // --- Response formatting ---

  private formatTable(startRow = 0, endRow?: number, startCol = 0, endCol?: number): string {
    const er = endRow ?? this.data.length - 1;
    const ec = endCol ?? this.colCount - 1;

    const visibleHeaders = ['Row', ...this.headers.slice(startCol, ec + 1)];
    const widths = visibleHeaders.map(h => h.length);

    const rows: string[][] = [];
    for (let r = startRow; r <= er && r < this.data.length; r++) {
      if (this.data[r].every(v => v === '')) continue;
      const row = [String(r + 1)];
      for (let c = startCol; c <= ec; c++) {
        const val = String(this.data[r]?.[c] ?? '');
        row.push(val);
        if (val.length > (widths[c - startCol + 1] || 0)) {
          widths[c - startCol + 1] = val.length;
        }
      }
      rows.push(row);
    }

    if (rows.length === 0) return '(empty spreadsheet)';

    // Update Row column width
    for (const row of rows) {
      if (row[0].length > widths[0]) widths[0] = row[0].length;
    }

    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));
    const header = '| ' + visibleHeaders.map((h, i) => pad(h, widths[i])).join(' | ') + ' |';
    const sep = '|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|';
    const body = rows.map(row => '| ' + row.map((v, i) => pad(v, widths[i])).join(' | ') + ' |');

    return [header, sep, ...body].join('\n');
  }

  private buildResponse(message: string, extraData?: Record<string, any>): Record<string, any> {
    // Collect non-empty data
    const data: string[][] = [];
    for (let r = 0; r < this.data.length; r++) {
      if (this.data[r].some(v => v !== '')) {
        data.push([...this.data[r]]);
      }
    }

    // Collect non-empty formulas for UI
    const formulasMap: Record<string, string> = {};
    for (let r = 0; r < this.formulas.length; r++) {
      for (let c = 0; c < (this.formulas[r]?.length || 0); c++) {
        if (this.formulas[r][c]) {
          formulasMap[this.headers[c] + (r + 1)] = this.formulas[r][c];
        }
      }
    }

    return {
      table: this.formatTable(),
      data,
      formulas: formulasMap,
      headers: [...this.headers],
      message,
      rows: this.rowCount,
      cols: this.colCount,
      instance: this.instanceId,
      ...extraData,
    };
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
    return this.buildResponse(`Spreadsheet "${this.instanceId}" loaded`);
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
      const { startRow, startCol, endRow, endCol } = this.rangeToIndices(params.range);
      return {
        ...this.buildResponse(`Viewing range ${params.range}`),
        table: this.formatTable(startRow, endRow, startCol, endCol),
      };
    }

    return this.buildResponse(`Spreadsheet "${this.instanceId}"`);
  }

  /**
   * Get a cell value
   *
   * Returns the evaluated value and formula (if any) for a single cell.
   *
   * @param cell Cell reference in A1 notation (e.g., "B3")
   */
  async get(params: { cell: string }) {
    await this.load();
    const { row, col } = this.cellToIndex(params.cell);

    if (row >= this.rowCount || col >= this.colCount) {
      return { cell: params.cell, value: '', formula: '', message: 'Cell is empty (out of range)' };
    }

    const value = this.data[row][col];
    const formula = this.formulas[row]?.[col] || '';

    return {
      cell: params.cell,
      value,
      formula,
      message: formula
        ? `${params.cell} = ${value} (formula: ${formula})`
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
    const { row, col } = this.cellToIndex(params.cell);
    this.ensureCapacity(row, col);

    const oldValue = this.data[row][col];
    const value = String(params.value);

    if (value.startsWith('=')) {
      this.formulas[row][col] = value;
      this.data[row][col] = String(this.evaluateFormula(value.substring(1), row, col));
    } else {
      this.formulas[row][col] = '';
      this.data[row][col] = value;
    }

    this.recalculateAll();
    await this.save();

    const msg = oldValue
      ? `Set ${params.cell} = ${this.data[row][col]} (was: ${oldValue})`
      : `Set ${params.cell} = ${this.data[row][col]}`;

    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Add a row of data
   *
   * Add a new row to the bottom of the spreadsheet. Pass column values by header name.
   *
   * @param values Key-value pairs mapping column names to values (e.g., {"A": "Alice", "B": "30"})
   * @example add({ values: { A: 'Alice', B: '30', C: 'Engineering' } })
   */
  async add(params: { values: Record<string, string> }) {
    await this.load();

    // Find first empty row
    let targetRow = this.data.length;
    for (let r = 0; r < this.data.length; r++) {
      if (this.data[r].every(v => v === '')) {
        targetRow = r;
        break;
      }
    }

    this.ensureCapacity(targetRow, this.colCount - 1);

    for (const [colName, value] of Object.entries(params.values)) {
      const colIndex = this.resolveColumnIndex(colName);
      if (colIndex >= 0) {
        this.ensureCapacity(targetRow, colIndex);
        const val = String(value);
        if (val.startsWith('=')) {
          this.formulas[targetRow][colIndex] = val;
          this.data[targetRow][colIndex] = String(this.evaluateFormula(val.substring(1), targetRow, colIndex));
        } else {
          this.data[targetRow][colIndex] = val;
        }
      }
    }

    this.recalculateAll();
    await this.save();

    const msg = `Added row ${targetRow + 1}`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Remove a row
   *
   * @param row Row number to remove (1-indexed)
   */
  async remove(params: { row: number }) {
    await this.load();
    const idx = params.row - 1;

    if (idx < 0 || idx >= this.data.length) {
      throw new Error(`Row ${params.row} does not exist`);
    }

    this.data.splice(idx, 1);
    this.formulas.splice(idx, 1);
    this.rowCount = Math.max(this.data.length, 1);

    this.recalculateAll();
    await this.save();

    const msg = `Removed row ${params.row}`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Update fields in a row
   *
   * @param row Row number to update (1-indexed)
   * @param values Key-value pairs mapping column names to new values
   * @example update({ row: 3, values: { B: '42', C: 'Updated' } })
   */
  async update(params: { row: number; values: Record<string, string> }) {
    await this.load();
    const idx = params.row - 1;

    if (idx < 0 || idx >= this.data.length) {
      throw new Error(`Row ${params.row} does not exist`);
    }

    const changes: string[] = [];
    for (const [colName, value] of Object.entries(params.values)) {
      const colIndex = this.resolveColumnIndex(colName);
      this.ensureCapacity(idx, colIndex);
      const old = this.data[idx][colIndex];
      const val = String(value);
      if (val.startsWith('=')) {
        this.formulas[idx][colIndex] = val;
        this.data[idx][colIndex] = String(this.evaluateFormula(val.substring(1), idx, colIndex));
      } else {
        this.formulas[idx][colIndex] = '';
        this.data[idx][colIndex] = val;
      }
      changes.push(`${colName}: ${old} -> ${this.data[idx][colIndex]}`);
    }

    this.recalculateAll();
    await this.save();

    const msg = `Updated row ${params.row}: ${changes.join(', ')}`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Query rows by condition
   *
   * Filter rows where a column matches a condition. Supports operators: =, !=, >, <, >=, <=, contains.
   *
   * @param where Condition string (e.g., "B > 25", "A contains Alice", "C = Done")
   * @param limit Max rows to return
   * @example query({ where: 'B > 25' })
   */
  async query(params: { where: string; limit?: number }) {
    await this.load();

    const { col, op, value } = this.parseCondition(params.where);
    const colIndex = this.resolveColumnIndex(col);

    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${col}`);
    }

    const matching: number[] = [];
    for (let r = 0; r < this.data.length; r++) {
      if (this.data[r].every(v => v === '')) continue;
      const cellVal = this.data[r][colIndex];
      if (this.matchCondition(cellVal, op, value)) {
        matching.push(r);
        if (params.limit && matching.length >= params.limit) break;
      }
    }

    const filteredData = matching.map(r => [...this.data[r]]);
    const table = this.formatFilteredTable(matching);

    return {
      table,
      data: filteredData,
      headers: [...this.headers],
      message: `Found ${matching.length} row(s) matching "${params.where}"`,
      matchCount: matching.length,
      rows: this.rowCount,
      cols: this.colCount,
    };
  }

  /**
   * Sort by column
   *
   * Sorts all data rows by the specified column.
   *
   * @param column Column name to sort by (e.g., "B")
   * @param order Sort order: "asc" or "desc" (default: "asc")
   * @example sort({ column: 'B', order: 'desc' })
   */
  async sort(params: { column: string; order?: string }) {
    await this.load();

    const colIndex = this.resolveColumnIndex(params.column);
    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${params.column}`);
    }

    const direction = params.order === 'desc' ? -1 : 1;

    // Build index of non-empty rows to sort
    const indices = Array.from({ length: this.data.length }, (_, i) => i);
    indices.sort((a, b) => {
      const va = this.data[a][colIndex];
      const vb = this.data[b][colIndex];
      // Empty rows go to bottom
      if (va === '' && vb === '') return 0;
      if (va === '') return 1;
      if (vb === '') return -1;
      // Numeric comparison if both are numbers
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * direction;
      // String comparison
      return va < vb ? -1 * direction : va > vb ? 1 * direction : 0;
    });

    this.data = indices.map(i => this.data[i]);
    this.formulas = indices.map(i => this.formulas[i]);

    this.recalculateAll();
    await this.save();

    const msg = `Sorted by ${params.column} (${params.order || 'asc'})`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Fill a range with values or a pattern
   *
   * Fill cells with a repeating pattern or arithmetic series.
   *
   * @param range Cell range (e.g., "A1:A10")
   * @param pattern Comma-separated values to repeat (e.g., "1,2,3" fills 1,2,3,1,2,3...)
   * @example fill({ range: 'A1:A10', pattern: '1,2,3' })
   */
  async fill(params: { range: string; pattern: string }) {
    await this.load();

    const { startRow, startCol, endRow, endCol } = this.rangeToIndices(params.range);
    const values = params.pattern.split(',').map(v => v.trim());

    let idx = 0;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this.ensureCapacity(r, c);
        this.data[r][c] = values[idx % values.length];
        this.formulas[r][c] = '';
        idx++;
      }
    }

    this.recalculateAll();
    await this.save();

    const msg = `Filled ${params.range} with pattern [${params.pattern}]`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Show column headers and detected types
   *
   * @format table
   */
  async schema() {
    await this.load();

    const schema = this.headers.map((h, i) => {
      const values = this.data.map(r => r[i]).filter(v => v !== '');
      const numericCount = values.filter(v => !isNaN(Number(v))).length;
      const type = values.length === 0 ? 'empty' : numericCount > values.length / 2 ? 'number' : 'text';
      return { column: h, type, nonEmpty: values.length, total: this.data.length };
    });

    const table = '| Column | Type | Non-empty | Total |\n|--------|------|-----------|-------|\n' +
      schema.map(s => `| ${s.column} | ${s.type} | ${s.nonEmpty} | ${s.total} |`).join('\n');

    return {
      table,
      schema,
      headers: [...this.headers],
      message: `${this.colCount} columns, ${this.rowCount} rows`,
      rows: this.rowCount,
      cols: this.colCount,
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

    if (params.rows !== undefined) {
      while (this.data.length < params.rows) {
        this.data.push(new Array(this.colCount).fill(''));
        this.formulas.push(new Array(this.colCount).fill(''));
      }
      if (params.rows < this.data.length) {
        this.data.length = params.rows;
        this.formulas.length = params.rows;
      }
      this.rowCount = params.rows;
    }

    if (params.cols !== undefined) {
      const newColCount = params.cols;
      if (newColCount > this.colCount) {
        for (let r = 0; r < this.rowCount; r++) {
          while (this.data[r].length < newColCount) this.data[r].push('');
          while (this.formulas[r].length < newColCount) this.formulas[r].push('');
        }
        while (this.headers.length < newColCount) {
          this.headers.push(this.numberToColumnName(this.headers.length));
        }
      } else {
        for (let r = 0; r < this.rowCount; r++) {
          this.data[r].length = newColCount;
          this.formulas[r].length = newColCount;
        }
        this.headers.length = newColCount;
      }
      this.colCount = newColCount;
    }

    await this.save();
    return this.buildResponse(`Resized to ${this.rowCount} rows x ${this.colCount} cols`);
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

    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) throw new Error('CSV is empty');

    const parsed = lines.map(l => this.parseCSVLine(l));
    const maxCols = Math.max(...parsed.map(r => r.length));

    // First row as headers
    this.headers = parsed[0];
    while (this.headers.length < maxCols) {
      this.headers.push(this.numberToColumnName(this.headers.length));
    }

    this.colCount = maxCols;
    this.rowCount = parsed.length - 1;
    this.data = [];
    this.formulas = [];

    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      while (row.length < maxCols) row.push('');
      this.data.push(row);
      const formulaRow = new Array(maxCols).fill('');
      // Detect formulas
      for (let c = 0; c < row.length; c++) {
        if (row[c].startsWith('=')) {
          formulaRow[c] = row[c];
          row[c] = String(this.evaluateFormula(row[c].substring(1), i - 1, c));
        }
      }
      this.formulas.push(formulaRow);
    }

    this.recalculateAll();
    this.loaded = true;
    await this.save();

    const msg = `Imported ${this.rowCount} rows x ${this.colCount} cols`;
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Export as CSV
   *
   * Export the spreadsheet data as CSV text, or save to a file.
   *
   * @param file Optional file path to save CSV to
   */
  async dump(params?: { file?: string }) {
    await this.load();

    const csvLines = [this.headers.map(h => this.escapeCSV(h)).join(',')];
    for (const row of this.data) {
      if (row.every(v => v === '')) continue;
      csvLines.push(row.map(v => this.escapeCSV(String(v))).join(','));
    }
    const csvText = csvLines.join('\n') + '\n';

    if (params?.file) {
      await fs.writeFile(params.file, csvText, 'utf-8');
      return { message: `Exported to ${params.file}`, file: params.file };
    }

    return { csv: csvText, message: `CSV export (${csvLines.length - 1} rows)` };
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

    if (params?.range) {
      const { startRow, startCol, endRow, endCol } = this.rangeToIndices(params.range);
      for (let r = startRow; r <= endRow && r < this.rowCount; r++) {
        for (let c = startCol; c <= endCol && c < this.colCount; c++) {
          this.data[r][c] = '';
          this.formulas[r][c] = '';
        }
      }
      this.recalculateAll();
      await this.save();
      const msg = `Cleared range ${params.range}`;
      this.emit({ emit: 'data', ...this.buildResponse(msg) });
      return this.buildResponse(msg);
    }

    this.initEmpty();
    this.recalculateAll();
    await this.save();
    const msg = 'Cleared all cells';
    this.emit({ emit: 'data', ...this.buildResponse(msg) });
    return this.buildResponse(msg);
  }

  /**
   * Rename a column header
   *
   * @param column Column letter (e.g., "A")
   * @param name New header name
   * @example rename({ column: 'A', name: 'Product' })
   */
  async rename(params: { column: string; name: string }) {
    await this.load();
    const colIndex = this.resolveColumnIndex(params.column);
    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${params.column}`);
    }

    const old = this.headers[colIndex];
    this.headers[colIndex] = params.name;
    await this.save();

    return this.buildResponse(`Renamed column ${params.column}: "${old}" -> "${params.name}"`);
  }

  // --- Query helpers ---

  private parseCondition(where: string): { col: string; op: string; value: string } {
    const ops = ['>=', '<=', '!=', '>', '<', '=', 'contains'];
    for (const op of ops) {
      const idx = where.toLowerCase().indexOf(` ${op} `) !== -1
        ? where.toLowerCase().indexOf(` ${op} `)
        : where.indexOf(op);
      if (idx !== -1) {
        const col = where.substring(0, idx).trim();
        const opLen = where.toLowerCase().indexOf(` ${op} `) !== -1 ? op.length + 2 : op.length;
        const value = where.substring(idx + opLen).trim();
        return { col, op, value };
      }
    }
    throw new Error(`Cannot parse condition: ${where}. Use format: "COLUMN OP VALUE" (e.g., "B > 25")`);
  }

  private matchCondition(cellVal: string, op: string, value: string): boolean {
    const numCell = Number(cellVal);
    const numVal = Number(value);
    const useNumeric = !isNaN(numCell) && !isNaN(numVal);

    switch (op) {
      case '=': return useNumeric ? numCell === numVal : cellVal === value;
      case '!=': return useNumeric ? numCell !== numVal : cellVal !== value;
      case '>': return useNumeric ? numCell > numVal : cellVal > value;
      case '<': return useNumeric ? numCell < numVal : cellVal < value;
      case '>=': return useNumeric ? numCell >= numVal : cellVal >= value;
      case '<=': return useNumeric ? numCell <= numVal : cellVal <= value;
      case 'contains': return cellVal.toLowerCase().includes(value.toLowerCase());
      default: return false;
    }
  }

  private formatFilteredTable(rowIndices: number[]): string {
    const visibleHeaders = ['Row', ...this.headers];
    const widths = visibleHeaders.map(h => h.length);

    const rows: string[][] = [];
    for (const r of rowIndices) {
      const row = [String(r + 1)];
      for (let c = 0; c < this.colCount; c++) {
        const val = String(this.data[r]?.[c] ?? '');
        row.push(val);
        if (val.length > (widths[c + 1] || 0)) widths[c + 1] = val.length;
      }
      rows.push(row);
    }

    if (rows.length === 0) return '(no matching rows)';

    for (const row of rows) {
      if (row[0].length > widths[0]) widths[0] = row[0].length;
    }

    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));
    const header = '| ' + visibleHeaders.map((h, i) => pad(h, widths[i])).join(' | ') + ' |';
    const sep = '|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|';
    const body = rows.map(row => '| ' + row.map((v, i) => pad(v, widths[i])).join(' | ') + ' |');

    return [header, sep, ...body].join('\n');
  }
}
