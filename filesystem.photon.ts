/**
 * Filesystem - File and directory operations
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 📁
 * @tags filesystem, files, directories
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
    workdir: string = path.join(homedir(), '.photon'),
    maxFileSize: number = 10485760,
    allowHidden: boolean = true
  ) {
    this.workdir = path.resolve(workdir);
    this.maxFileSize = maxFileSize;
    this.allowHidden = allowHidden;
    if (!existsSync(this.workdir)) {
      throw new Error(`Working directory does not exist: ${this.workdir}`);
    }
  }

  /**
   * Read file contents
   * @param path File path {@example README.md}
   * @param encoding File encoding {@choice utf8,base64,hex} {@default utf8}
   * @format markdown
   * @timeout 10s
   */
  async read(params: { path: string; encoding?: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes`);
    }

    const content = await fs.readFile(filePath, params.encoding || 'utf-8');
    return content;
  }

  /**
   * Write content to file
   * @param path File path {@example README.md}
   * @param content File content {@field textarea}
   * @param encoding File encoding {@default utf8}
   * @timeout 15s
   */
  async write(params: { path: string; content: string; encoding?: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const contentSize = Buffer.byteLength(params.content, params.encoding as BufferEncoding || 'utf-8');
    if (contentSize > this.maxFileSize) {
      throw new Error(`Content too large: ${contentSize} bytes`);
    }

    await fs.writeFile(filePath, params.content, params.encoding || 'utf-8');
    const stats = await fs.stat(filePath);
    return { path: filePath, size: stats.size };
  }

  /**
   * Append content to file
   * @param path File path
   * @param content Content to append
   * @param encoding File encoding {@default utf8}
   * @timeout 10s
   */
  async append(params: { path: string; content: string; encoding?: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    await fs.appendFile(filePath, params.content, params.encoding || 'utf-8');
    const stats = await fs.stat(filePath);
    return { path: filePath, size: stats.size };
  }

  /**
   * Delete a file
   * @param path File path
   * @timeout 5s
   */
  async remove(params: { path: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      throw new Error('Path is a directory, use remove-dir instead');
    }

    await fs.unlink(filePath);
    return { message: 'File deleted' };
  }

  /**
   * Copy a file
   * @param source Source file path
   * @param destination Destination file path
   * @timeout 30s
   */
  async copy(params: { source: string; destination: string }) {
    const sourcePath = this.resolvePath(params.source);
    const destPath = this.resolvePath(params.destination);
    this.validatePath(sourcePath);
    this.validatePath(destPath);

    await fs.copyFile(sourcePath, destPath);
    const stats = await fs.stat(destPath);
    return { source: sourcePath, destination: destPath, size: stats.size };
  }

  /**
   * Move/rename a file
   * @param source Source file path
   * @param destination Destination file path
   * @timeout 15s
   */
  async move(params: { source: string; destination: string }) {
    const sourcePath = this.resolvePath(params.source);
    const destPath = this.resolvePath(params.destination);
    this.validatePath(sourcePath);
    this.validatePath(destPath);

    await fs.rename(sourcePath, destPath);
    return { source: sourcePath, destination: destPath };
  }

  /**
   * List directory contents
   * @param path Directory path {@default .}
   * @param recursive List recursively {@default false}
   * @format table
   * @timeout 15s
   */
  async list(params?: { path?: string; recursive?: boolean }) {
    const dirPath = this.resolvePath(params?.path || '.');
    this.validatePath(dirPath);

    return await this._listDirectory(dirPath, params?.recursive || false);
  }

  /**
   * Create a directory
   * @param path Directory path
   * @param recursive Create parents {@default true}
   */
  async mkdir(params: { path: string; recursive?: boolean }) {
    const dirPath = this.resolvePath(params.path);
    this.validatePath(dirPath);

    await fs.mkdir(dirPath, { recursive: params.recursive !== false });
    return { path: dirPath };
  }

  /**
   * Delete a directory
   * @param path Directory path
   * @param recursive Delete with contents {@default false}
   * @timeout 10s
   */
  async rmdir(params: { path: string; recursive?: boolean }) {
    const dirPath = this.resolvePath(params.path);
    this.validatePath(dirPath);

    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory, use remove instead');
    }

    await fs.rm(dirPath, { recursive: params.recursive || false });
    return { path: dirPath };
  }

  /**
   * Get file info
   * @param path File or directory path
   * @format table
   */
  async info(params: { path: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);

    const stats = await fs.stat(filePath);
    return {
      name: path.basename(filePath),
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      modified: stats.mtime,
    };
  }

  /**
   * Check if path exists
   * @param path File or directory path
   */
  async exists(params: { path: string }) {
    const filePath = this.resolvePath(params.path);
    this.validatePath(filePath);
    return { exists: existsSync(filePath) };
  }

  /**
   * Search for files matching pattern
   * @param pattern File glob pattern {@example *.txt}
   * @param path Directory to search {@default .}
   * @format table
   * @timeout 30s
   */
  async search(params: { pattern: string; path?: string }) {
    const searchPath = this.resolvePath(params.path || '.');
    this.validatePath(searchPath);
    return await this._searchDirectory(searchPath, params.pattern);
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
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(this.workdir)) {
      throw new Error(`Access denied: outside workdir`);
    }
    if (!this.allowHidden) {
      const parts = normalized.split(path.sep);
      if (parts.some(p => p.startsWith('.') && p !== '.' && p !== '..')) {
        throw new Error(`Access denied: hidden files not allowed`);
      }
    }
  }

  private async _listDirectory(dirPath: string, recursive: boolean): Promise<any[]> {
    const entries: any[] = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      if (!this.allowHidden && item.name.startsWith('.')) continue;

      const fullPath = path.join(dirPath, item.name);
      const stats = await fs.stat(fullPath);

      entries.push({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime,
      });

      if (recursive && item.isDirectory()) {
        entries.push(...await this._listDirectory(fullPath, true));
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
        if (!this.allowHidden && item.name.startsWith('.')) continue;

        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
          await search(fullPath);
        } else if (regex.test(item.name)) {
          const stats = await fs.stat(fullPath);
          results.push({
            name: item.name,
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
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`, 'i');
  }
}
