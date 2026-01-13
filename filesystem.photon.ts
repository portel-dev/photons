/**
 * Filesystem - File and directory operations
 *
 * Provides safe, cross-platform file system operations using Node.js native APIs.
 * All paths are validated and restricted to the working directory for security.
 *
 * Common use cases:
 * - Reading files: "Read my project README.md"
 * - Writing files: "Save this data to report.json"
 * - Directory operations: "List all files in my Downloads folder"
 * - File management: "Copy config.json to config.backup.json"
 *
 * Example: read({ path: "README.md" })
 *
 * Configuration:
 * - workdir: Working directory base path (default: ~/Documents)
 * - maxFileSize: Maximum file size in bytes (default: 10MB)
 * - allowHidden: Allow access to hidden files/directories (default: false)
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync, statSync } from 'fs';
import { homedir } from 'os';

export default class Filesystem {
  private workdir: string;
  private maxFileSize: number;
  private allowHidden: boolean;

  constructor(
    workdir: string = process.cwd(),
    maxFileSize: number = 10485760, // 10MB
    allowHidden: boolean = true
  ) {
    // Resolve and normalize workdir
    this.workdir = path.resolve(workdir);
    this.maxFileSize = maxFileSize;
    this.allowHidden = allowHidden;

    // Validate workdir exists
    if (!existsSync(this.workdir)) {
      throw new Error(`Working directory does not exist: ${this.workdir}`);
    }
  }

  async onInitialize() {
    // Photon ready - beam UI shows status
  }

  /**
   * Read file contents
   * @param path File path (relative to workdir or absolute)
   * @param encoding File encoding (default: utf-8)
   * @format markdown
   */
  async read(params: { path: string; encoding?: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize} bytes)`);
    }

    const content = await fs.readFile(filePath, params.encoding || 'utf-8');
    return content as string;
  }

  /**
   * Write content to file
   * @param path File path (relative to workdir or absolute)
   * @param content File content
   * @param encoding File encoding (default: utf-8)
   */
  async write(params: { path: string; content: string; encoding?: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const contentSize = Buffer.byteLength(params.content, params.encoding as BufferEncoding || 'utf-8');
    if (contentSize > this.maxFileSize) {
      throw new Error(`Content too large: ${contentSize} bytes (max: ${this.maxFileSize} bytes)`);
    }

    await fs.writeFile(filePath, params.content, params.encoding || 'utf-8');
    const stats = await fs.stat(filePath);
    return `Wrote ${stats.size} bytes to \`${filePath}\``;
  }

  /**
   * Append content to file
   * @param path File path (relative to workdir or absolute)
   * @param content Content to append
   * @param encoding File encoding (default: utf-8)
   */
  async append(params: { path: string; content: string; encoding?: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    await fs.appendFile(filePath, params.content, params.encoding || 'utf-8');
    const stats = await fs.stat(filePath);
    return `Appended to \`${filePath}\` (now ${stats.size} bytes)`;
  }

  /**
   * Remove a file
   * @param path File path (relative to workdir or absolute)
   */
  async remove(params: { path: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      throw new Error('Path is a directory. Use rmdir instead.');
    }

    await fs.unlink(filePath);
    return `Deleted \`${filePath}\``;
  }

  /**
   * Copy a file
   * @param source Source file path
   * @param destination Destination file path
   */
  async copy(params: { source: string; destination: string }): Promise<string> {
    const sourcePath = this.resolvePath(params.source);
    const destPath = this.resolvePath(params.destination);

    this.validatePath(sourcePath);
    this.validatePath(destPath);

    await fs.copyFile(sourcePath, destPath);
    const stats = await fs.stat(destPath);
    return `Copied \`${sourcePath}\` to \`${destPath}\` (${stats.size} bytes)`;
  }

  /**
   * Move/rename a file
   * @param source Source file path
   * @param destination Destination file path
   */
  async move(params: { source: string; destination: string }): Promise<string> {
    const sourcePath = this.resolvePath(params.source);
    const destPath = this.resolvePath(params.destination);

    this.validatePath(sourcePath);
    this.validatePath(destPath);

    await fs.rename(sourcePath, destPath);
    return `Moved \`${sourcePath}\` to \`${destPath}\``;
  }

  /**
   * List files in a directory
   * @param path Directory path (relative to workdir or absolute, default: current workdir)
   * @param recursive List files recursively (default: false)
   * @format table
   */
  async list(params?: { path?: string; recursive?: boolean }) {
    const dirPath = this.resolvePath(params?.path || '.');
    this.validatePath(dirPath);

    const entries = await this._listDirectory(dirPath, params?.recursive || false);
    return entries;
  }

  /**
   * Create a directory
   * @param path Directory path (relative to workdir or absolute)
   * @param recursive Create parent directories if needed (default: true)
   */
  async mkdir(params: { path: string; recursive?: boolean }): Promise<string> {
    const dirPath = this.resolvePath(params.path);
    this.validatePath(dirPath);

    await fs.mkdir(dirPath, { recursive: params.recursive !== false });
    return `Created directory \`${dirPath}\``;
  }

  /**
   * Remove a directory
   * @param path Directory path (relative to workdir or absolute)
   * @param recursive Remove directory and all contents (default: false)
   */
  async rmdir(params: { path: string; recursive?: boolean }): Promise<string> {
    const dirPath = this.resolvePath(params.path);
    this.validatePath(dirPath);

    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory. Use remove instead.');
    }

    await fs.rm(dirPath, { recursive: params.recursive || false });
    return `Deleted directory \`${dirPath}\``;
  }

  /**
   * Get file or directory information
   * @param path File or directory path
   * @format markdown
   */
  async info(params: { path: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    const type = stats.isDirectory() ? 'directory' : 'file';

    return `**${path.basename(filePath)}** (${type})

| Property | Value |
|----------|-------|
| Path | \`${filePath}\` |
| Size | ${stats.size} bytes |
| Created | ${stats.birthtime.toISOString()} |
| Modified | ${stats.mtime.toISOString()} |
| Permissions | ${stats.mode.toString(8).slice(-3)} |`;
  }

  /**
   * Check if file or directory exists
   * @param path File or directory path
   */
  async exists(params: { path: string }): Promise<string> {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const exists = existsSync(filePath);
    return exists ? `\`${filePath}\` exists` : `\`${filePath}\` does not exist`;
  }

  /**
   * Search for files matching a pattern
   * @param pattern File name pattern (glob-style: *.txt, **\/*.js)
   * @param path Directory to search (default: workdir)
   * @format table
   */
  async search(params: { pattern: string; path?: string }) {
    const searchPath = this.resolvePath(params.path || '.');
    this.validatePath(searchPath);

    const results = await this._searchDirectory(searchPath, params.pattern);
    return results;
  }

  /**
   * Get current working directory
   */
  async workdir(): Promise<string> {
    return `Working directory: \`${this.workdir}\``;
  }

  // Private helper methods

  private resolvePath(filePath: string): string {
    // If absolute path, use as-is; otherwise resolve relative to workdir
    if (path.isAbsolute(filePath)) {
      return path.normalize(filePath);
    }
    return path.resolve(this.workdir, filePath);
  }

  private validatePath(filePath: string): void {
    // Ensure path is within workdir (prevent path traversal)
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(this.workdir)) {
      throw new Error(`Access denied: Path outside working directory: ${filePath}`);
    }

    // Check for hidden files/directories if not allowed
    if (!this.allowHidden) {
      const parts = normalized.split(path.sep);
      const hasHidden = parts.some(part => part.startsWith('.') && part !== '.' && part !== '..');
      if (hasHidden) {
        throw new Error(`Access denied: Hidden files/directories not allowed: ${filePath}`);
      }
    }
  }

  private async _listDirectory(dirPath: string, recursive: boolean): Promise<any[]> {
    const entries: any[] = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      // Skip hidden files if not allowed
      if (!this.allowHidden && item.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, item.name);
      const stats = await fs.stat(fullPath);

      const entry = {
        name: item.name,
        path: fullPath,
        type: item.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime,
      };

      entries.push(entry);

      // Recurse into subdirectories
      if (recursive && item.isDirectory()) {
        const subEntries = await this._listDirectory(fullPath, true);
        entries.push(...subEntries);
      }
    }

    return entries;
  }

  private async _searchDirectory(dirPath: string, pattern: string): Promise<any[]> {
    const results: any[] = [];
    const regex = this.globToRegex(pattern);

    const search = async (currentPath: string) => {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        // Skip hidden files if not allowed
        if (!this.allowHidden && item.name.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
          await search(fullPath);
        } else if (regex.test(item.name)) {
          const stats = await fs.stat(fullPath);
          results.push({
            name: item.name,
            path: fullPath,
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }
    };

    await search(dirPath);
    return results;
  }

  private globToRegex(pattern: string): RegExp {
    // Convert glob pattern to regex
    let regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    return new RegExp(`^${regexPattern}$`, 'i');
  }
}
