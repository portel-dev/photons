/**
 * Spreadsheet — CSV-backed spreadsheet with formulas
 *
 * A spreadsheet engine that works on plain CSV files. Formulas (=SUM, =AVG, etc.)
 * are stored directly in CSV cells and evaluated at runtime. Named instances map
 * to CSV files: `_use('budget')` → `budget.csv` in your spreadsheets folder.
 * Pass a full path to open any CSV: `_use('/path/to/data.csv')`.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags spreadsheet, csv, formulas, data
 * @icon 📊
 * @stateful
 * @dependencies alasql
 * @ui spreadsheet ./ui/spreadsheet.html
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, mkdirSync, statSync, watch as fsWatch, type FSWatcher } from 'fs';

// Visual formula types that render as chart overlays instead of scalar values
const VISUAL_FORMULAS = new Set(['PIE', 'BAR', 'LINE', 'SPARKLINE', 'GAUGE']);

interface WatchDef {
  name: string;
  query: string;
  action?: string;              // cross-photon call target: "photonName.method"
  actionParams?: Record<string, any>;
  once: boolean;                // fire once then auto-remove
  lastTriggered?: string;       // ISO timestamp
  triggerCount: number;
}

interface ChartDescriptor {
  cell: string;
  type: 'pie' | 'bar' | 'line' | 'sparkline' | 'gauge';
  labelRange?: string;
  valueRange?: string;
  resolvedLabels: string[];
  resolvedValues: number[];
  min?: number;
  max?: number;
}

export default class Spreadsheet {
  // Raw cell contents — plain values or formula strings (=SUM(...))
  private cells: string[][] = [];
  private headers: string[] = [];
  private columnMeta: { align: string; type: string; width?: number; required?: boolean; sort?: string; wrap?: boolean }[] = [];
  private hasFormatRow = false;
  private metaCustomized = false; // true if user changed alignment/type/width after load
  private rowCount = 0;
  private colCount = 0;
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

    // Absolute path — use as-is
    if (path.isAbsolute(name)) {
      return name.endsWith('.csv') ? name : name + '.csv';
    }

    // Relative path with directory separators — resolve from cwd
    if (name.includes('/') || name.includes('\\')) {
      const resolved = path.resolve(name);
      return resolved.endsWith('.csv') ? resolved : resolved + '.csv';
    }

    // Simple name — resolve from spreadsheets folder
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
      const lines = csv.split('\n').filter(l => l.length > 0);

      if (lines.length > 0) {
        const firstRow = this.parseCSVLine(lines[0]);

        // Check if row 0 is a format row
        let dataStart: number;
        if (this.isFormatRow(firstRow)) {
          this.hasFormatRow = true;
          this.columnMeta = firstRow.map(c => this.parseFormatCell(c));
          this.headers = lines.length > 1 ? this.parseCSVLine(lines[1]) : firstRow.map((_, i) => this.numberToColumnName(i));
          dataStart = 2;
        } else {
          this.hasFormatRow = false;
          this.headers = firstRow;
          dataStart = 1;
        }

        this.colCount = this.headers.length;
        this.rowCount = lines.length - dataStart;
        this.cells = [];

        for (let i = dataStart; i < lines.length; i++) {
          const row = this.parseCSVLine(lines[i]);
          while (row.length < this.colCount) row.push('');
          this.cells.push(row);
        }

        // Ensure columnMeta matches header count
        if (!this.hasFormatRow || this.columnMeta.length < this.colCount) {
          while (this.columnMeta.length < this.colCount) {
            this.columnMeta.push({ align: 'left', type: 'text' });
          }
        }

        this.loaded = true;
        return;
      }
    }

    // New empty spreadsheet
    this.colCount = 10;
    this.rowCount = 0;
    this.headers = [];
    for (let i = 0; i < this.colCount; i++) {
      this.headers.push(this.numberToColumnName(i));
    }
    this.cells = [];
    this.hasFormatRow = false;
    this.initDefaultMeta();
    this.loaded = true;
  }

  private async save(): Promise<void> {
    // Ensure parent directory exists
    const dir = path.dirname(this.csvPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Trim trailing empty rows
    let lastDataRow = -1;
    for (let r = this.cells.length - 1; r >= 0; r--) {
      if (this.cells[r].some(v => v !== '')) {
        lastDataRow = r;
        break;
      }
    }

    const rows = this.cells.slice(0, lastDataRow + 1);
    const csvLines: string[] = [];

    if (this.shouldWriteFormatRow()) {
      csvLines.push(this.buildFormatRow().join(','));
    }

    csvLines.push(this.headers.map(h => this.escapeCSV(h)).join(','));
    for (const row of rows) {
      csvLines.push(row.map(v => this.escapeCSV(v)).join(','));
    }
    await fs.writeFile(this.csvPath, csvLines.join('\n') + '\n', 'utf-8');
  }

  // --- CSV helpers ---

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.startsWith('=')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote ("") → literal "
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
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

  // --- Format row helpers ---

  /** Detect if a row of cells is a format/separator row (all cells match dash pattern) */
  private isFormatRow(cells: string[]): boolean {
    return cells.length > 0 && cells.every(c => /^[<>]?:?-{2,}[^,]*:?$/.test(c.trim().replace(/\+/g, '')));
  }

  /** Parse a single format cell like `:---#:` or `---$:` */
  private parseFormatCell(cell: string): { align: string; type: string; width?: number; required?: boolean; sort?: string; wrap?: boolean } {
    const s = cell.trim();
    const align = s.startsWith(':') && s.endsWith(':') ? 'center'
      : s.endsWith(':') ? 'right' : 'left';

    const typeMap: Record<string, string> = { '#': 'number', '$': 'currency', '%': 'percent', 'D': 'date', '?': 'bool', '=': 'select', '~': 'formula', 'M': 'markdown', 'T': 'longtext' };
    const typeMatch = s.match(/[#$%D?=~MT]/);
    const type = typeMatch ? (typeMap[typeMatch[0]] || 'text') : 'text';

    const widthMatch = s.match(/w(\d+)/);
    const width = widthMatch ? parseInt(widthMatch[1]) : undefined;

    const required = s.includes('*');
    const wrap = s.includes('+');
    const sort = s.startsWith('>') ? 'asc' : s.startsWith('<') ? 'desc' : undefined;

    return { align, type, width, required, sort, wrap };
  }

  /** Build format row cells from current columnMeta */
  private buildFormatRow(): string[] {
    return this.columnMeta.map(m => {
      let cell = '';
      if (m.sort === 'asc') cell += '>';
      else if (m.sort === 'desc') cell += '<';
      if (m.align === 'center' || m.align === 'left') cell += ':';
      cell += '---';
      const typeMap: Record<string, string> = { number: '#', currency: '$', percent: '%', date: 'D', bool: '?', select: '=', formula: '~', markdown: 'M', longtext: 'T' };
      if (typeMap[m.type]) cell += typeMap[m.type];
      if (m.width) cell += `w${m.width}`;
      if (m.wrap) cell += '+';
      if (m.required) cell += '*';
      if (m.align === 'center' || m.align === 'right') cell += ':';
      return cell;
    });
  }

  /** Initialize default metadata for columns (all left-aligned text) */
  private initDefaultMeta(): void {
    this.columnMeta = this.headers.map(() => ({ align: 'left', type: 'text', wrap: false }));
  }

  /** Should we write the format row on save? */
  private shouldWriteFormatRow(): boolean {
    const fmt = this.settings?.formatting || 'auto';
    if (fmt === 'true') return true;
    if (fmt === 'false') return false;
    // auto: write if original had one OR if user customized formatting
    return this.hasFormatRow || this.metaCustomized;
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
    const colMatch = range.match(/^([A-Za-z]+):([A-Za-z]+)$/);
    if (colMatch) {
      return {
        startCol: this.columnNameToNumber(colMatch[1]),
        startRow: 0,
        endCol: this.columnNameToNumber(colMatch[2]),
        endRow: Math.max(this.cells.length - 1, 0),
      };
    }
    const parts = range.split(':');
    if (parts.length !== 2) throw new Error(`Invalid range: ${range}`);
    const start = this.cellToIndex(parts[0]);
    const end = this.cellToIndex(parts[1]);
    return { startRow: start.row, startCol: start.col, endRow: end.row, endCol: end.col };
  }

  private resolveColumnIndex(name: string): number {
    const headerIdx = this.headers.indexOf(name);
    if (headerIdx !== -1) return headerIdx;
    const lowerName = name.toLowerCase();
    const ciIdx = this.headers.findIndex(h => h.toLowerCase() === lowerName);
    if (ciIdx !== -1) return ciIdx;
    return this.columnNameToNumber(name);
  }

  private ensureCapacity(row: number, col: number): void {
    while (this.cells.length <= row) {
      this.cells.push(new Array(this.colCount).fill(''));
    }
    this.rowCount = this.cells.length;
    if (col >= this.colCount) {
      const newColCount = col + 1;
      for (const r of this.cells) {
        while (r.length < newColCount) r.push('');
      }
      while (this.headers.length < newColCount) {
        this.headers.push(this.numberToColumnName(this.headers.length));
      }
      while (this.columnMeta.length < newColCount) {
        this.columnMeta.push({ align: 'left', type: 'text' });
      }
      this.colCount = newColCount;
    }
  }

  // --- Formula engine ---

  /** Evaluate a single cell, returning the computed value */
  private evaluate(row: number, col: number): string {
    const raw = this.cells[row]?.[col] ?? '';
    if (!raw.startsWith('=')) return raw;
    const result = this.evaluateFormula(raw.substring(1), row, col);
    return String(result);
  }

  /** Build a fully-evaluated snapshot of all cells */
  private evaluateAll(): string[][] {
    const result: string[][] = [];
    for (let r = 0; r < this.cells.length; r++) {
      const row: string[] = [];
      for (let c = 0; c < this.colCount; c++) {
        row.push(this.evaluate(r, c));
      }
      result.push(row);
    }
    return result;
  }

  /** Detect if a formula is a visual formula (returns marker instead of value) */
  private isVisualFormula(formula: string): boolean {
    const match = formula.trim().match(/^([A-Z]+)\s*\(/i);
    return match ? VISUAL_FORMULAS.has(match[1].toUpperCase()) : false;
  }

  /** Parse a visual formula and return a ChartDescriptor */
  private parseVisualFormula(formula: string, row: number, col: number): ChartDescriptor | null {
    const match = formula.trim().match(/^([A-Z]+)\s*\((.+)\)$/i);
    if (!match) return null;

    const type = match[1].toUpperCase() as 'PIE' | 'BAR' | 'LINE' | 'SPARKLINE' | 'GAUGE';
    const argsStr = match[2];
    const args = this.splitFormulaArgs(argsStr);
    const cellRef = this.numberToColumnName(col) + (row + 1);

    if (type === 'SPARKLINE') {
      // SPARKLINE(valueRange)
      const values = this.resolveRangeToNumbers(args[0]?.trim());
      return { cell: cellRef, type: 'sparkline', valueRange: args[0]?.trim(), resolvedLabels: [], resolvedValues: values };
    }

    if (type === 'GAUGE') {
      // GAUGE(cell, min, max)
      const val = this.resolveRangeToNumbers(args[0]?.trim());
      const min = args[1] ? parseFloat(args[1].trim()) : 0;
      const max = args[2] ? parseFloat(args[2].trim()) : 100;
      return { cell: cellRef, type: 'gauge', resolvedLabels: [], resolvedValues: val, min, max };
    }

    // PIE, BAR, LINE: (labelRange, valueRange)
    const labelRange = args[0]?.trim();
    const valueRange = args[1]?.trim();

    const labels = labelRange ? this.resolveRangeToStrings(labelRange) : [];
    const values = valueRange ? this.resolveRangeToNumbers(valueRange) : [];

    return {
      cell: cellRef,
      type: type.toLowerCase() as 'pie' | 'bar' | 'line',
      labelRange,
      valueRange,
      resolvedLabels: labels,
      resolvedValues: values,
    };
  }

  /** Split formula arguments respecting nested parens */
  private splitFormulaArgs(argsStr: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of argsStr) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current) result.push(current);
    return result;
  }

  /** Resolve a range reference (e.g., "A1:A5") to string values */
  private resolveRangeToStrings(range: string): string[] {
    try {
      const { startRow, startCol, endRow, endCol } = this.rangeToIndices(range);
      const values: string[] = [];
      for (let r = startRow; r <= endRow && r < this.cells.length; r++) {
        for (let c = startCol; c <= endCol && c < this.colCount; c++) {
          values.push(this.evaluate(r, c) || '');
        }
      }
      return values;
    } catch {
      // Single cell reference
      try {
        const { row, col } = this.cellToIndex(range);
        return [this.evaluate(row, col) || ''];
      } catch {
        return [];
      }
    }
  }

  /** Resolve a range reference to numeric values */
  private resolveRangeToNumbers(range: string): number[] {
    try {
      const { startRow, startCol, endRow, endCol } = this.rangeToIndices(range);
      const values: number[] = [];
      for (let r = startRow; r <= endRow && r < this.cells.length; r++) {
        for (let c = startCol; c <= endCol && c < this.colCount; c++) {
          const val = parseFloat(this.evaluate(r, c));
          if (!isNaN(val)) values.push(val);
        }
      }
      return values;
    } catch {
      // Single cell reference
      try {
        const { row, col } = this.cellToIndex(range);
        const val = parseFloat(this.evaluate(row, col));
        return isNaN(val) ? [] : [val];
      } catch {
        return [];
      }
    }
  }

  private evaluateFormula(formula: string, currentRow: number, currentCol: number): string | number {
    try {
      let processed = formula.trim();

      // Visual formulas return a marker — actual rendering happens in UI
      if (this.isVisualFormula(processed)) {
        const match = processed.match(/^([A-Z]+)/i);
        return `[${match![1].toUpperCase()}]`;
      }

      const functionNames = ['SUM', 'AVG', 'AVERAGE', 'MAX', 'MIN', 'COUNT', 'IF', 'LEN', 'CONCAT', 'ABS', 'ROUND'];

      // Step 1: Replace cell range references FIRST (A1:B2)
      processed = processed.replace(/([A-Z]+)(\d+):([A-Z]+)(\d+)/gi, (_m, col, row, endCol, endRow) => {
        return this.getRangeValues(col.toUpperCase(), parseInt(row), endCol.toUpperCase(), parseInt(endRow));
      });

      // Step 2: Replace single cell references and header-based references
      processed = processed.replace(/([A-Za-z_][A-Za-z0-9_]*)(\d+)/g, (match, header, rowNum) => {
        if (functionNames.includes(header.toUpperCase())) return match;

        // Column letter reference (A1)
        if (header === header.toUpperCase()) {
          const colIndex = this.columnNameToNumber(header);
          const rowIndex = parseInt(rowNum) - 1;
          if (colIndex >= 0 && colIndex < this.colCount && rowIndex >= 0 && rowIndex < this.cells.length) {
            const value = this.evaluate(rowIndex, colIndex);
            if (value === '') return '0';
            return isNaN(Number(value)) ? `"${value}"` : value;
          }
        }

        // Header name reference (Name2)
        const headerIdx = this.headers.indexOf(header);
        if (headerIdx !== -1 && parseInt(rowNum) > 0 && parseInt(rowNum) <= this.cells.length) {
          const value = this.evaluate(parseInt(rowNum) - 1, headerIdx);
          if (value === '') return '0';
          return isNaN(Number(value)) ? `"${value}"` : value;
        }

        return match;
      });

      processed = this.evaluateFunctions(processed);

      // If the result is a quoted string, return it directly (don't run through safeEval which strips letters)
      const trimmedResult = processed.trim();
      if (trimmedResult.startsWith('"') && trimmedResult.endsWith('"')) {
        return trimmedResult.slice(1, -1);
      }

      const result = this.safeEval(processed);
      if (typeof result === 'number' && !isNaN(result)) {
        return Math.round(result * 100000000) / 100000000;
      }
      return result;
    } catch {
      return '#ERROR';
    }
  }

  private getRangeValues(startCol: string, startRow: number, endCol: string, endRow: number): string {
    const sc = this.columnNameToNumber(startCol);
    const ec = this.columnNameToNumber(endCol);
    const sr = startRow - 1;
    const er = endRow - 1;

    const values: number[] = [];
    for (let r = sr; r <= er; r++) {
      for (let c = sc; c <= ec; c++) {
        if (r >= 0 && r < this.cells.length && c >= 0 && c < this.colCount) {
          const val = parseFloat(this.evaluate(r, c));
          if (!isNaN(val)) values.push(val);
        }
      }
    }
    return `[${values.join(',')}]`;
  }

  private evaluateFunctions(formula: string): string {
    formula = formula.replace(/SUM\(([^)]+)\)/gi, (_m, range) => {
      const v = this.parseRangeValues(range);
      return String(v.reduce((a, b) => a + b, 0));
    });
    formula = formula.replace(/(?:AVG|AVERAGE)\(([^)]+)\)/gi, (_m, range) => {
      const v = this.parseRangeValues(range);
      return String(v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
    });
    formula = formula.replace(/MAX\(([^)]+)\)/gi, (_m, range) => {
      const v = this.parseRangeValues(range);
      return String(v.length ? Math.max(...v) : 0);
    });
    formula = formula.replace(/MIN\(([^)]+)\)/gi, (_m, range) => {
      const v = this.parseRangeValues(range);
      return String(v.length ? Math.min(...v) : 0);
    });
    formula = formula.replace(/COUNT\(([^)]+)\)/gi, (_m, range) => {
      return String(this.parseRangeValues(range).length);
    });
    formula = formula.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/gi, (_m, cond, t, f) => {
      return this.safeEval(cond) ? t.trim() : f.trim();
    });
    formula = formula.replace(/LEN\(([^)]+)\)/gi, (_m, arg) => {
      const trimmed = arg.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return String(trimmed.slice(1, -1).length);
      }
      const val = String(this.safeEval(trimmed));
      return String(val.replace(/"/g, '').length);
    });
    formula = formula.replace(/ABS\(([^)]+)\)/gi, (_m, arg) => {
      return String(Math.abs(Number(this.safeEval(arg))));
    });
    formula = formula.replace(/ROUND\(([^,]+)(?:,([^)]+))?\)/gi, (_m, arg, dec) => {
      const val = Number(this.safeEval(arg));
      const d = dec ? Number(this.safeEval(dec)) : 0;
      return String(Math.round(val * Math.pow(10, d)) / Math.pow(10, d));
    });
    formula = formula.replace(/CONCAT\(([^)]+)\)/gi, (_m, args) => {
      const parts = args.split(',').map((a: string) => {
        return String(this.safeEval(a.trim())).replace(/"/g, '');
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

  // --- Response formatting ---

  private formatTable(evaluated: string[][], startRow = 0, endRow?: number, startCol = 0, endCol?: number): string {
    const er = endRow ?? evaluated.length - 1;
    const ec = endCol ?? this.colCount - 1;

    const visibleHeaders = ['Row', ...this.headers.slice(startCol, ec + 1)];
    const widths = visibleHeaders.map(h => h.length);

    const rows: string[][] = [];
    for (let r = startRow; r <= er && r < evaluated.length; r++) {
      if (evaluated[r].every(v => v === '')) continue;
      const row = [String(r + 1)];
      for (let c = startCol; c <= ec; c++) {
        const val = evaluated[r]?.[c] ?? '';
        row.push(val);
        if (val.length > (widths[c - startCol + 1] || 0)) {
          widths[c - startCol + 1] = val.length;
        }
      }
      rows.push(row);
    }

    if (rows.length === 0) return '(empty spreadsheet)';

    for (const row of rows) {
      if (row[0].length > widths[0]) widths[0] = row[0].length;
    }

    const padAligned = (s: string, w: number, align: string) => {
      const gap = Math.max(0, w - s.length);
      if (align === 'right') return ' '.repeat(gap) + s;
      if (align === 'center') return ' '.repeat(Math.floor(gap / 2)) + s + ' '.repeat(Math.ceil(gap / 2));
      return s + ' '.repeat(gap);
    };
    const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));
    const header = '| ' + visibleHeaders.map((h, i) => pad(h, widths[i])).join(' | ') + ' |';
    const sepCells = widths.map((w, i) => {
      const meta = i === 0 ? null : this.columnMeta[i - 1 + startCol];
      const align = meta?.align || 'left';
      const dashes = '-'.repeat(w);
      if (align === 'center') return ':' + dashes + ':';
      if (align === 'right') return ' ' + dashes + ':';
      return ':' + dashes + ' ';
    });
    const sep = '|' + sepCells.join('|') + '|';
    const body = rows.map(row => '| ' + row.map((v, i) => {
      const meta = i === 0 ? null : this.columnMeta[i - 1 + startCol];
      return padAligned(v, widths[i], meta?.align || 'left');
    }).join(' | ') + ' |');

    return [header, sep, ...body].join('\n');
  }

  private buildResponse(message: string): Record<string, any> {
    const evaluated = this.evaluateAll();

    // Evaluated data (non-empty rows only)
    const data: string[][] = [];
    for (const row of evaluated) {
      if (row.some(v => v !== '')) data.push([...row]);
    }

    // Raw formulas map for UI formula bar
    const formulas: Record<string, string> = {};
    // Charts extracted from visual formulas
    const charts: ChartDescriptor[] = [];

    for (let r = 0; r < this.cells.length; r++) {
      for (let c = 0; c < this.colCount; c++) {
        const raw = this.cells[r][c];
        if (raw?.startsWith('=')) {
          formulas[this.headers[c] + (r + 1)] = raw;

          // Detect visual formulas and build chart descriptors
          const formulaBody = raw.substring(1);
          if (this.isVisualFormula(formulaBody)) {
            const chart = this.parseVisualFormula(formulaBody, r, c);
            if (chart) charts.push(chart);
          }
        }
      }
    }

    const response: Record<string, any> = {
      table: this.formatTable(evaluated),
      data,
      formulas,
      headers: [...this.headers],
      columnMeta: this.columnMeta.map(m => ({ ...m })),
      message,
      rows: this.cells.length,
      cols: this.colCount,
      file: this.csvPath,
    };

    if (charts.length > 0) {
      response.charts = charts;
    }

    return response;
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
      const { startRow, startCol, endRow, endCol } = this.rangeToIndices(params.range);
      const evaluated = this.evaluateAll();
      return {
        ...this.buildResponse(`Viewing range ${params.range}`),
        table: this.formatTable(evaluated, startRow, endRow, startCol, endCol),
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
    const { row, col } = this.cellToIndex(params.cell);

    if (row >= this.cells.length || col >= this.colCount) {
      return { cell: params.cell, value: '', raw: '', message: 'Cell is empty' };
    }

    const raw = this.cells[row][col];
    const value = this.evaluate(row, col);

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
    const { row, col } = this.cellToIndex(params.cell);
    this.ensureCapacity(row, col);

    const oldRaw = this.cells[row][col];
    this.cells[row][col] = String(params.value);

    await this.save();

    const evaluated = this.evaluate(row, col);
    const oldDisplay = oldRaw.startsWith('=') ? this.evaluateFormula(oldRaw.substring(1), row, col) : oldRaw;
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

    // Find first empty row or append
    let targetRow = this.cells.length;
    for (let r = 0; r < this.cells.length; r++) {
      if (this.cells[r].every(v => v === '')) {
        targetRow = r;
        break;
      }
    }

    this.ensureCapacity(targetRow, this.colCount - 1);

    for (const [colName, value] of Object.entries(params.values)) {
      const colIndex = this.resolveColumnIndex(colName);
      if (colIndex >= 0) {
        this.ensureCapacity(targetRow, colIndex);
        this.cells[targetRow][colIndex] = String(value);
      }
    }

    await this.save();

    const msg = `Added row ${targetRow + 1}`;
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
    const idx = params.row - 1;

    if (idx < 0 || idx >= this.cells.length) {
      throw new Error(`Row ${params.row} does not exist`);
    }

    this.cells.splice(idx, 1);
    this.rowCount = this.cells.length;

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
    const idx = params.row - 1;

    if (idx < 0 || idx >= this.cells.length) {
      throw new Error(`Row ${params.row} does not exist`);
    }

    const changes: string[] = [];
    for (const [colName, value] of Object.entries(params.values)) {
      const colIndex = this.resolveColumnIndex(colName);
      this.ensureCapacity(idx, colIndex);
      const old = this.evaluate(idx, colIndex);
      this.cells[idx][colIndex] = String(value);
      changes.push(`${colName}: ${old} -> ${this.evaluate(idx, colIndex)}`);
    }

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

    const { col, op, value } = this.parseCondition(params.where);
    const colIndex = this.resolveColumnIndex(col);

    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${col}`);
    }

    const evaluated = this.evaluateAll();
    const matching: number[] = [];
    for (let r = 0; r < evaluated.length; r++) {
      if (evaluated[r].every(v => v === '')) continue;
      if (this.matchCondition(evaluated[r][colIndex], op, value)) {
        matching.push(r);
        if (params.limit && matching.length >= params.limit) break;
      }
    }

    const filteredData = matching.map(r => [...evaluated[r]]);
    const table = this.formatFilteredTable(evaluated, matching);

    return {
      table,
      data: filteredData,
      headers: [...this.headers],
      message: `Found ${matching.length} row(s) matching "${params.where}"`,
      matchCount: matching.length,
    };
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

    const colIndex = this.resolveColumnIndex(params.column);
    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${params.column}`);
    }

    const direction = params.order === 'desc' ? -1 : 1;
    const evaluated = this.evaluateAll();

    const indices = Array.from({ length: this.cells.length }, (_, i) => i);
    indices.sort((a, b) => {
      const va = evaluated[a][colIndex];
      const vb = evaluated[b][colIndex];
      if (va === '' && vb === '') return 0;
      if (va === '') return 1;
      if (vb === '') return -1;
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * direction;
      return va < vb ? -1 * direction : va > vb ? 1 * direction : 0;
    });

    this.cells = indices.map(i => this.cells[i]);

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

    const { startRow, startCol, endRow, endCol } = this.rangeToIndices(params.range);
    const values = params.pattern.split(',').map(v => v.trim());

    let idx = 0;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this.ensureCapacity(r, c);
        this.cells[r][c] = values[idx % values.length];
        idx++;
      }
    }

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
    const evaluated = this.evaluateAll();

    const schema = this.headers.map((h, i) => {
      const values = evaluated.map(r => r[i]).filter(v => v !== '');
      const numericCount = values.filter(v => !isNaN(Number(v))).length;
      const detectedType = values.length === 0 ? 'empty' : numericCount > values.length / 2 ? 'number' : 'text';
      const meta = this.columnMeta[i] || { align: 'left', type: 'text' };
      return { column: h, type: meta.type !== 'text' ? meta.type : detectedType, align: meta.align, nonEmpty: values.length, total: evaluated.length };
    });

    const table = '| Column | Type | Non-empty | Total |\n|--------|------|-----------|-------|\n' +
      schema.map(s => `| ${s.column} | ${s.type} | ${s.nonEmpty} | ${s.total} |`).join('\n');

    return {
      table,
      schema,
      headers: [...this.headers],
      message: `${this.colCount} columns, ${this.cells.length} rows`,
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

    if (params.rows !== undefined) {
      while (this.cells.length < params.rows) {
        this.cells.push(new Array(this.colCount).fill(''));
      }
      if (params.rows < this.cells.length) {
        this.cells.length = params.rows;
      }
      this.rowCount = this.cells.length;
    }

    if (params.cols !== undefined) {
      if (params.cols > this.colCount) {
        for (const r of this.cells) {
          while (r.length < params.cols) r.push('');
        }
        while (this.headers.length < params.cols) {
          this.headers.push(this.numberToColumnName(this.headers.length));
        }
      } else {
        for (const r of this.cells) r.length = params.cols;
        this.headers.length = params.cols;
      }
      this.colCount = params.cols;
    }

    await this.save();
    return this.buildResponse(`Resized to ${this.cells.length} rows x ${this.colCount} cols`);
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

    // Detect format row
    let dataStart: number;
    if (this.isFormatRow(parsed[0])) {
      this.hasFormatRow = true;
      this.columnMeta = parsed[0].map(c => this.parseFormatCell(c));
      this.headers = parsed.length > 1 ? parsed[1] : parsed[0].map((_, i) => this.numberToColumnName(i));
      dataStart = 2;
    } else {
      this.hasFormatRow = false;
      this.headers = parsed[0];
      dataStart = 1;
    }

    while (this.headers.length < maxCols) {
      this.headers.push(this.numberToColumnName(this.headers.length));
    }

    this.colCount = maxCols;
    this.cells = [];
    for (let i = dataStart; i < parsed.length; i++) {
      const row = parsed[i];
      while (row.length < maxCols) row.push('');
      this.cells.push(row);
    }
    this.rowCount = this.cells.length;

    // Ensure columnMeta matches
    if (!this.hasFormatRow) {
      this.initDefaultMeta();
    }
    while (this.columnMeta.length < maxCols) {
      this.columnMeta.push({ align: 'left', type: 'text' });
    }

    this.loaded = true;

    await this.save();

    const msg = `Imported ${this.cells.length} rows x ${this.colCount} cols`;
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

    const csvLines: string[] = [];
    if (this.shouldWriteFormatRow()) {
      csvLines.push(this.buildFormatRow().join(','));
    }
    csvLines.push(this.headers.map(h => this.escapeCSV(h)).join(','));
    for (const row of this.cells) {
      if (row.every(v => v === '')) continue;
      csvLines.push(row.map(v => this.escapeCSV(v)).join(','));
    }
    const csvText = csvLines.join('\n') + '\n';

    if (params?.file) {
      const dir = path.dirname(params.file);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
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
      for (let r = startRow; r <= endRow && r < this.cells.length; r++) {
        for (let c = startCol; c <= endCol && c < this.colCount; c++) {
          this.cells[r][c] = '';
        }
      }
      await this.save();
      const msg = `Cleared range ${params.range}`;
      await this._emitAndWatch(msg);
      return this.buildResponse(msg);
    }

    this.cells = [];
    this.rowCount = 0;
    await this.save();
    const msg = 'Cleared all cells';
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
    const colIndex = this.resolveColumnIndex(params.column);
    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${params.column}`);
    }

    const old = this.headers[colIndex];
    this.headers[colIndex] = params.name;
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
    const colIndex = this.resolveColumnIndex(params.column);
    if (colIndex < 0 || colIndex >= this.colCount) {
      throw new Error(`Unknown column: ${params.column}`);
    }

    const meta = this.columnMeta[colIndex];
    const changes: string[] = [];

    if (params.align && ['left', 'right', 'center'].includes(params.align)) {
      meta.align = params.align;
      changes.push(`align=${params.align}`);
    }
    if (params.type) {
      meta.type = params.type;
      changes.push(`type=${params.type}`);
    }
    if (params.width !== undefined) {
      meta.width = params.width;
      changes.push(`width=${params.width}`);
    }
    if (params.wrap !== undefined) {
      meta.wrap = params.wrap;
      changes.push(`wrap=${params.wrap}`);
    }

    if (changes.length > 0) {
      this.metaCustomized = true;
      await this.save();
    }

    const msg = `Formatted ${this.headers[colIndex]}: ${changes.join(', ')}`;
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
    this._watcherAutoStarted = false; // explicit tail — don't auto-stop

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

    let added = 0;
    for (const row of params.rows) {
      const targetRow = this.cells.length;
      this.ensureCapacity(targetRow, this.colCount - 1);

      if (Array.isArray(row)) {
        for (let c = 0; c < row.length && c < this.colCount; c++) {
          this.cells[targetRow][c] = String(row[c]);
        }
      } else {
        for (const [colName, value] of Object.entries(row)) {
          const colIndex = this.resolveColumnIndex(colName);
          if (colIndex >= 0) {
            this.ensureCapacity(targetRow, colIndex);
            this.cells[targetRow][colIndex] = String(value);
          }
        }
      }
      added++;
    }

    await this.save();

    const msg = `Pushed ${added} row(s) (${this.cells.length} total)`;
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
        // File was truncated or unchanged — do a full reload
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

      // Parse and append new rows
      let added = 0;
      for (const line of newLines) {
        const values = this.parseCSVLine(line);

        // Skip if it looks like a header row (matches current headers)
        if (values.length === this.headers.length && values.every((v, i) => v === this.headers[i])) continue;
        // Skip format rows
        if (this.isFormatRow(values)) continue;

        const targetRow = this.cells.length;
        this.ensureCapacity(targetRow, Math.max(this.colCount - 1, values.length - 1));
        for (let c = 0; c < values.length; c++) {
          this.cells[targetRow][c] = values[c];
        }
        added++;
      }

      if (added > 0) {
        this.rowCount = this.cells.length;
        const msg = `+${added} row(s) from file (${this.cells.length} total)`;
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
    const alasql = require('alasql');
    const rows = this._dataAsObjects();

    // Allow users to write "FROM data" — rewrite to "FROM ?" for alasql
    const query = this._sqlRewrite(params.query);
    const result = alasql(query, [rows]);
    return { result, count: Array.isArray(result) ? result.length : 1, message: `Query returned ${Array.isArray(result) ? result.length : 1} result(s)` };
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

    // Auto-start file watching if not already active
    if (!this._watcher) {
      this._startFileWatching();
      this._watcherAutoStarted = true;
    }

    // Run query immediately to check current state
    const alasql = require('alasql');
    const rows = this._dataAsObjects();
    let currentMatches = 0;
    try {
      const q = this._sqlRewrite(params.query);
      const result = alasql(q, [rows]);
      currentMatches = Array.isArray(result) ? result.length : 0;
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

    // Auto-stop file watching if no watches remain and it was auto-started
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

  /** Rewrite "FROM data" to "FROM ?" for alasql parameter binding */
  private _sqlRewrite(query: string): string {
    return query.replace(/\bFROM\s+data\b/gi, 'FROM ?');
  }

  // --- Emit + watch pipeline ---

  private async _emitAndWatch(msg: string, opts: Record<string, any> = {}): Promise<void> {
    this.emit({ emit: 'data', ...this.buildResponse(msg), ...opts });
    await this._rerunWatches();
  }

  private _dataAsObjects(): Record<string, any>[] {
    const evaluated = this.evaluateAll();
    const rows: Record<string, any>[] = [];

    for (const row of evaluated) {
      if (row.every(v => v === '')) continue;
      const obj: Record<string, any> = {};
      for (let c = 0; c < this.headers.length; c++) {
        const raw = row[c] ?? '';
        const meta = this.columnMeta[c];
        // Coerce numeric types
        if (meta && ['number', 'currency', 'percent'].includes(meta.type)) {
          const cleaned = raw.replace(/[$%,]/g, '');
          const num = Number(cleaned);
          obj[this.headers[c]] = isNaN(num) ? raw : num;
        } else {
          // Auto-coerce if it looks numeric
          const num = Number(raw);
          obj[this.headers[c]] = raw !== '' && !isNaN(num) ? num : raw;
        }
      }
      rows.push(obj);
    }

    return rows;
  }

  private async _rerunWatches(): Promise<void> {
    if (this._watches.size === 0) return;

    const alasql = require('alasql');
    const rows = this._dataAsObjects();

    for (const [name, watch] of this._watches) {
      try {
        const q = this._sqlRewrite(watch.query);
        const result = alasql(q, [rows]);
        if (Array.isArray(result) && result.length > 0) {
          watch.triggerCount++;
          watch.lastTriggered = new Date().toISOString();
          this.emit({ emit: 'alert', watch: name, rows: result, count: result.length });

          if (watch.action && this.call) {
            try {
              await this.call(watch.action, { ...watch.actionParams, _matchedRows: result });
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

  // --- Query helpers ---

  private parseCondition(where: string): { col: string; op: string; value: string } {
    const ops = ['>=', '<=', '!=', '>', '<', '=', 'contains'];
    for (const op of ops) {
      const spaced = where.toLowerCase().indexOf(` ${op} `);
      if (spaced !== -1) {
        return {
          col: where.substring(0, spaced).trim(),
          op,
          value: where.substring(spaced + op.length + 2).trim(),
        };
      }
    }
    // Try without spaces for operators like > < =
    for (const op of ops.filter(o => o.length <= 2)) {
      const idx = where.indexOf(op);
      if (idx !== -1) {
        return {
          col: where.substring(0, idx).trim(),
          op,
          value: where.substring(idx + op.length).trim(),
        };
      }
    }
    throw new Error(`Cannot parse condition: "${where}". Use: "COLUMN OP VALUE" (e.g., "Age > 25")`);
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

  private formatFilteredTable(evaluated: string[][], rowIndices: number[]): string {
    const visibleHeaders = ['Row', ...this.headers];
    const widths = visibleHeaders.map(h => h.length);

    const rows: string[][] = [];
    for (const r of rowIndices) {
      const row = [String(r + 1)];
      for (let c = 0; c < this.colCount; c++) {
        const val = evaluated[r]?.[c] ?? '';
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
