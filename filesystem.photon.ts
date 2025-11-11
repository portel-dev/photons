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
 * Example: read("README.md")
 * Example: write("report.json", '{"data": "value"}')
 * Example: copy("config.json", "config.backup.json")
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
   * @example read("README.md")
   * @example read("data.txt", "utf-8")
   * @example read({ path: "README.md", encoding: "utf-8" })
   */
  async read(params: { path: string; encoding?: string } | string, encoding?: string) {
    // Support both read("path", "encoding") and read({ path, encoding })
    const filePath = typeof params === 'string' ? params : params.path;
    const fileEncoding = typeof params === 'string' ? encoding : params.encoding;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      // Check file size
      const stats = await fs.stat(resolvedPath);
      if (stats.size > this.maxFileSize) {
        return {
          success: false,
          error: `File too large: ${stats.size} bytes (max: ${this.maxFileSize} bytes)`,
        };
      }

      const content = await fs.readFile(resolvedPath, fileEncoding || 'utf-8');

      return {
        success: true,
        path: resolvedPath,
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
   * @example write("report.json", '{"name": "John"}')
   * @example write("data.txt", "Hello World", "utf-8")
   * @example write({ path: "report.json", content: '{"name": "John"}', encoding: "utf-8" })
   */
  async write(params: { path: string; content: string; encoding?: string } | string, content?: string, encoding?: string) {
    // Support both write("path", "content", "encoding") and write({ path, content, encoding })
    const filePath = typeof params === 'string' ? params : params.path;
    const fileContent = typeof params === 'string' ? content! : params.content;
    const fileEncoding = typeof params === 'string' ? encoding : params.encoding;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      // Check content size
      const contentSize = Buffer.byteLength(fileContent, fileEncoding as BufferEncoding || 'utf-8');
      if (contentSize > this.maxFileSize) {
        return {
          success: false,
          error: `Content too large: ${contentSize} bytes (max: ${this.maxFileSize} bytes)`,
        };
      }

      await fs.writeFile(resolvedPath, fileContent, fileEncoding || 'utf-8');

      const stats = await fs.stat(resolvedPath);

      return {
        success: true,
        path: resolvedPath,
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
   * @example append("log.txt", "New log entry\n")
   * @example append("data.txt", "More data", "utf-8")
   * @example append({ path: "log.txt", content: "New entry\n", encoding: "utf-8" })
   */
  async append(params: { path: string; content: string; encoding?: string } | string, content?: string, encoding?: string) {
    // Support both append("path", "content", "encoding") and append({ path, content, encoding })
    const filePath = typeof params === 'string' ? params : params.path;
    const fileContent = typeof params === 'string' ? content! : params.content;
    const fileEncoding = typeof params === 'string' ? encoding : params.encoding;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      await fs.appendFile(resolvedPath, fileContent, fileEncoding || 'utf-8');

      const stats = await fs.stat(resolvedPath);

      return {
        success: true,
        path: resolvedPath,
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
   * Remove a file
   * @param path File path (relative to workdir or absolute)
   * @example remove("old-file.txt")
   * @example remove({ path: "old-file.txt" })
   */
  async remove(params: { path: string } | string) {
    // Support both remove("path") and remove({ path })
    const filePath = typeof params === 'string' ? params : params.path;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      // Ensure it's a file, not a directory
      const stats = await fs.stat(resolvedPath);
      if (stats.isDirectory()) {
        return {
          success: false,
          error: 'Path is a directory. Use rmdir instead.',
        };
      }

      await fs.unlink(resolvedPath);

      return {
        success: true,
        path: resolvedPath,
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
   * @example copy("config.json", "config.backup.json")
   * @example copy({ source: "config.json", destination: "config.backup.json" })
   */
  async copy(params: { source: string; destination: string } | string, destination?: string) {
    // Support both copy("source", "destination") and copy({ source, destination })
    const sourcePath = typeof params === 'string' ? params : params.source;
    const destPath = typeof params === 'string' ? destination! : params.destination;

    try {
      const resolvedSource = this.resolvePath(sourcePath);
      const resolvedDest = this.resolvePath(destPath);

      this.validatePath(resolvedSource);
      this.validatePath(resolvedDest);

      await fs.copyFile(resolvedSource, resolvedDest);

      const stats = await fs.stat(resolvedDest);

      return {
        success: true,
        source: resolvedSource,
        destination: resolvedDest,
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
   * @example move("old-name.txt", "new-name.txt")
   * @example move({ source: "old-name.txt", destination: "new-name.txt" })
   */
  async move(params: { source: string; destination: string } | string, destination?: string) {
    // Support both move("source", "destination") and move({ source, destination })
    const sourcePath = typeof params === 'string' ? params : params.source;
    const destPath = typeof params === 'string' ? destination! : params.destination;

    try {
      const resolvedSource = this.resolvePath(sourcePath);
      const resolvedDest = this.resolvePath(destPath);

      this.validatePath(resolvedSource);
      this.validatePath(resolvedDest);

      await fs.rename(resolvedSource, resolvedDest);

      return {
        success: true,
        source: resolvedSource,
        destination: resolvedDest,
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
   * @example list()
   * @example list("my-folder")
   * @example list("my-folder", true)
   * @example list({ path: "my-folder", recursive: true })
   */
  async list(params?: { path?: string; recursive?: boolean } | string, recursive?: boolean) {
    // Support list(), list("path"), list("path", true), or list({ path, recursive })
    const dirPath = typeof params === 'string' ? params : (params?.path || '.');
    const isRecursive = typeof params === 'string' ? (recursive || false) : (params?.recursive || false);

    try {
      const resolvedPath = this.resolvePath(dirPath);
      this.validatePath(resolvedPath);

      const entries = await this._listDirectory(resolvedPath, isRecursive);

      return {
        success: true,
        path: resolvedPath,
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
   * @example mkdir("new-folder")
   * @example mkdir("parent/child", true)
   * @example mkdir({ path: "new-folder", recursive: true })
   */
  async mkdir(params: { path: string; recursive?: boolean } | string, recursive?: boolean) {
    // Support both mkdir("path", recursive) and mkdir({ path, recursive })
    const dirPath = typeof params === 'string' ? params : params.path;
    const isRecursive = typeof params === 'string' ? (recursive !== false) : (params.recursive !== false);

    try {
      const resolvedPath = this.resolvePath(dirPath);
      this.validatePath(resolvedPath);

      await fs.mkdir(resolvedPath, { recursive: isRecursive });

      return {
        success: true,
        path: resolvedPath,
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
   * Remove a directory
   * @param path Directory path (relative to workdir or absolute)
   * @param recursive Remove directory and all contents (default: false)
   * @example rmdir("old-folder")
   * @example rmdir("folder-with-files", true)
   * @example rmdir({ path: "old-folder", recursive: true })
   */
  async rmdir(params: { path: string; recursive?: boolean } | string, recursive?: boolean) {
    // Support both rmdir("path", recursive) and rmdir({ path, recursive })
    const dirPath = typeof params === 'string' ? params : params.path;
    const isRecursive = typeof params === 'string' ? (recursive || false) : (params.recursive || false);

    try {
      const resolvedPath = this.resolvePath(dirPath);
      this.validatePath(resolvedPath);

      // Ensure it's a directory
      const stats = await fs.stat(resolvedPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: 'Path is not a directory. Use remove instead.',
        };
      }

      await fs.rm(resolvedPath, { recursive: isRecursive });

      return {
        success: true,
        path: resolvedPath,
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
   * @example info("README.md")
   * @example info({ path: "README.md" })
   */
  async info(params: { path: string } | string) {
    // Support both info("path") and info({ path })
    const filePath = typeof params === 'string' ? params : params.path;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      const stats = await fs.stat(resolvedPath);

      return {
        success: true,
        path: resolvedPath,
        name: path.basename(resolvedPath),
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
   * @example exists("config.json")
   * @example exists({ path: "config.json" })
   */
  async exists(params: { path: string } | string) {
    // Support both exists("path") and exists({ path })
    const filePath = typeof params === 'string' ? params : params.path;

    try {
      const resolvedPath = this.resolvePath(filePath);
      this.validatePath(resolvedPath);

      const exists = existsSync(resolvedPath);

      return {
        success: true,
        path: resolvedPath,
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
   * @example search("*.txt")
   * @example search("*.js", "src")
   * @example search({ pattern: "*.txt", path: "documents" })
   */
  async search(params: { pattern: string; path?: string } | string, path?: string) {
    // Support both search("pattern", "path") and search({ pattern, path })
    const pattern = typeof params === 'string' ? params : params.pattern;
    const searchPath = typeof params === 'string' ? (path || '.') : (params.path || '.');

    try {
      const resolvedPath = this.resolvePath(searchPath);
      this.validatePath(resolvedPath);

      const results = await this._searchDirectory(resolvedPath, pattern);

      return {
        success: true,
        pattern,
        path: resolvedPath,
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
  async workdir() {
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
