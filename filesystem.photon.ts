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
 * Example: readFile({ path: "README.md" })
 *
 * Configuration:
 * - workdir: Working directory base path (default: ~/Documents)
 * - maxFileSize: Maximum file size in bytes (default: 10MB)
 * - allowHidden: Allow access to hidden files/directories (default: false)
 *
 * @version 1.0.0
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
    workdir: string = path.join(homedir(), 'Documents'),
    maxFileSize: number = 10485760, // 10MB
    allowHidden: boolean = false
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
    console.error('[filesystem] ✅ Initialized');
    console.error(`[filesystem] Working directory: ${this.workdir}`);
    console.error(`[filesystem] Max file size: ${(this.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
    console.error(`[filesystem] Hidden files: ${this.allowHidden ? 'allowed' : 'blocked'}`);
  }

  /**
   * Read file contents
   * @param path File path (relative to workdir or absolute)
   * @param encoding File encoding (default: utf-8)
   */
  async readFile(params: { path: string; encoding?: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      // Check file size
      const stats = await fs.stat(filePath);
      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large: ${stats.size} bytes (max: ${this.maxFileSize} bytes)`,
        };
      }

      const content = await fs.readFile(filePath, params.encoding || 'utf-8');

      return {
        success: true,
        path: filePath,
        content,
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Write content to file
   * @param path File path (relative to workdir or absolute)
   * @param content File content
   * @param encoding File encoding (default: utf-8)
   */
  async writeFile(params: { path: string; content: string; encoding?: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      // Check content size
      const contentSize = Buffer.byteLength(params.content, params.encoding as BufferEncoding || 'utf-8');
      if (contentSize > this.maxFileSize) {
        return {
          success: false,
          error: `Content too large: ${contentSize} bytes (max: ${this.maxFileSize} bytes)`,
        };
      }

      await fs.writeFile(filePath, params.content, params.encoding || 'utf-8');

      const stats = await fs.stat(filePath);

      return {
        success: true,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Append content to file
   * @param path File path (relative to workdir or absolute)
   * @param content Content to append
   * @param encoding File encoding (default: utf-8)
   */
  async appendFile(params: { path: string; content: string; encoding?: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      await fs.appendFile(filePath, params.content, params.encoding || 'utf-8');

      const stats = await fs.stat(filePath);

      return {
        success: true,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a file
   * @param path File path (relative to workdir or absolute)
   */
  async deleteFile(params: { path: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      // Ensure it's a file, not a directory
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        return {
          success: false,
          error: 'Path is a directory. Use deleteDirectory instead.',
        };
      }

      await fs.unlink(filePath);

      return {
        success: true,
        path: filePath,
        message: 'File deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Copy a file
   * @param source Source file path
   * @param destination Destination file path
   */
  async copyFile(params: { source: string; destination: string }) {
    try {
      const sourcePath = this.resolvePath(params.source);
      const destPath = this.resolvePath(params.destination);

      this.validatePath(sourcePath);
      this.validatePath(destPath);

      await fs.copyFile(sourcePath, destPath);

      const stats = await fs.stat(destPath);

      return {
        success: true,
        source: sourcePath,
        destination: destPath,
        size: stats.size,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Move/rename a file
   * @param source Source file path
   * @param destination Destination file path
   */
  async moveFile(params: { source: string; destination: string }) {
    try {
      const sourcePath = this.resolvePath(params.source);
      const destPath = this.resolvePath(params.destination);

      this.validatePath(sourcePath);
      this.validatePath(destPath);

      await fs.rename(sourcePath, destPath);

      return {
        success: true,
        source: sourcePath,
        destination: destPath,
        message: 'File moved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List files in a directory
   * @param path Directory path (relative to workdir or absolute, default: current workdir)
   * @param recursive List files recursively (default: false)
   */
  async listFiles(params?: { path?: string; recursive?: boolean }) {
    try {
      const dirPath = this.resolvePath(params?.path || '.');
      this.validatePath(dirPath);

      const entries = await this._listDirectory(dirPath, params?.recursive || false);

      return {
        success: true,
        path: dirPath,
        count: entries.length,
        files: entries,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a directory
   * @param path Directory path (relative to workdir or absolute)
   * @param recursive Create parent directories if needed (default: true)
   */
  async createDirectory(params: { path: string; recursive?: boolean }) {
    try {
      const dirPath = this.resolvePath(params.path);
      this.validatePath(dirPath);

      await fs.mkdir(dirPath, { recursive: params.recursive !== false });

      return {
        success: true,
        path: dirPath,
        message: 'Directory created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a directory
   * @param path Directory path (relative to workdir or absolute)
   * @param recursive Delete directory and all contents (default: false)
   */
  async deleteDirectory(params: { path: string; recursive?: boolean }) {
    try {
      const dirPath = this.resolvePath(params.path);
      this.validatePath(dirPath);

      // Ensure it's a directory
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: 'Path is not a directory. Use deleteFile instead.',
        };
      }

      await fs.rm(dirPath, { recursive: params.recursive || false });

      return {
        success: true,
        path: dirPath,
        message: 'Directory deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file or directory information
   * @param path File or directory path
   */
  async getFileInfo(params: { path: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      const stats = await fs.stat(filePath);

      return {
        success: true,
        path: filePath,
        name: path.basename(filePath),
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        permissions: stats.mode.toString(8).slice(-3),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if file or directory exists
   * @param path File or directory path
   */
  async exists(params: { path: string }) {
    try {
      const filePath = this.resolvePath(params.path);
      this.validatePath(filePath);

      const exists = existsSync(filePath);

      return {
        success: true,
        path: filePath,
        exists,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search for files matching a pattern
   * @param pattern File name pattern (glob-style: *.txt, **\/*.js)
   * @param path Directory to search (default: workdir)
   */
  async searchFiles(params: { pattern: string; path?: string }) {
    try {
      const searchPath = this.resolvePath(params.path || '.');
      this.validatePath(searchPath);

      const results = await this._searchDirectory(searchPath, params.pattern);

      return {
        success: true,
        pattern: params.pattern,
        path: searchPath,
        count: results.length,
        files: results,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get current working directory
   */
  async getWorkdir(params: {}) {
    return {
      success: true,
      workdir: this.workdir,
    };
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
