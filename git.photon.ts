/**
 * Git - Local git repository operations
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies simple-git@^3.21.0
 * @icon 🔀
 * @tags git, version-control, repository
 */

import simpleGit, { SimpleGit, LogResult, StatusResult, BranchSummary } from 'simple-git';
import { existsSync } from 'fs';
import { resolve } from 'path';

export default class Git {
  private defaultRepoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.defaultRepoPath = resolve(repoPath);
  }

  /**
   * Get repository status
   * @param path Repository path {@default .}
   * @format table
   */
  async status(params?: { path?: string }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const s = await git.status();

    return {
      path: repoPath,
      branch: s.current,
      ahead: s.ahead,
      behind: s.behind,
      staged: s.staged.length,
      modified: s.modified.length,
      deleted: s.deleted.length,
      created: s.created.length,
      renamed: s.renamed.length,
      conflicted: s.conflicted.length,
      untracked: s.not_added.length,
      isClean: s.isClean(),
    };
  }

  /**
   * View commit history
   * @param path Repository path {@default .}
   * @param maxCount Maximum commits {@min 1} {@max 100} {@default 10}
   * @param branch Branch name {@example main}
   * @format table
   */
  async log(params?: { path?: string; maxCount?: number; branch?: string }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const log = await git.log({
      maxCount: params?.maxCount || 10,
      from: params?.branch,
    });

    return log.all.map((c) => ({
      hash: c.hash?.slice(0, 7),
      date: c.date,
      author: c.author_name,
      message: c.message,
    }));
  }

  /**
   * Show differences
   * @param path Repository path {@default .}
   * @param staged Show staged changes only {@default false}
   * @param file Specific file to diff
   * @format code:diff
   */
  async diff(params?: { path?: string; staged?: boolean; file?: string }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const options: string[] = [];
    if (params?.staged) options.push('--cached');
    if (params?.file) options.push('--', params.file);

    return await git.diff(options);
  }

  /**
   * List all branches
   * @param path Repository path {@default .}
   * @format table
   */
  async branches(params?: { path?: string }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const b = await git.branch();

    return Object.entries(b.branches).map(([name, info]) => ({
      name,
      current: info.current ? '✓' : '',
      commit: info.commit?.slice(0, 7),
    }));
  }

  /**
   * Create a branch
   * @param name Branch name {@example feature/new-feature}
   * @param path Repository path {@default .}
   * @param checkout Checkout after creation {@default false}
   */
  async branch(params: { name: string; path?: string; checkout?: boolean }) {
    const repoPath = this._resolvePath(params.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    if (params.checkout) {
      await git.checkoutLocalBranch(params.name);
    } else {
      await git.branch([params.name]);
    }

    return { message: `Branch '${params.name}' created` };
  }

  /**
   * Switch to a branch
   * @param name Branch name {@example main}
   * @param path Repository path {@default .}
   */
  async checkout(params: { name: string; path?: string }) {
    const repoPath = this._resolvePath(params.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    await git.checkout(params.name);

    return { message: `Switched to '${params.name}'` };
  }

  /**
   * Delete a branch
   * @param name Branch name {@example old-feature}
   * @param path Repository path {@default .}
   * @param force Force delete if unmerged {@default false}
   */
  async removeBranch(params: { name: string; path?: string; force?: boolean }) {
    const repoPath = this._resolvePath(params.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    await git.deleteLocalBranch(params.name, params.force || false);

    return { message: `Branch '${params.name}' deleted` };
  }

  /**
   * Stage files for commit
   * @param files File paths to stage {@example ["src/index.ts","README.md"]}
   * @param path Repository path {@default .}
   */
  async add(params: { files: string[]; path?: string }) {
    const repoPath = this._resolvePath(params.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    await git.add(params.files);

    return { message: `Staged ${params.files.length} file(s)` };
  }

  /**
   * Create a commit
   * @param message Commit message {@example fix: resolve authentication bug}
   * @param path Repository path {@default .}
   * @param author Author override (format: "Name <email>")
   */
  async commit(params: { message: string; path?: string; author?: string }) {
    const repoPath = this._resolvePath(params.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const opts: any = {};
    if (params.author) opts['--author'] = params.author;

    const result = await git.commit(params.message, undefined, opts);
    return { commit: result.commit, message: `Committed: ${result.commit}` };
  }

  /**
   * Push commits to remote
   * @param path Repository path {@default .}
   * @param remote Remote name {@default origin}
   * @param branch Branch name (current if omitted)
   * @param force Force push {@default false}
   */
  async push(params?: { path?: string; remote?: string; branch?: string; force?: boolean }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const opts: any = {};
    if (params?.force) opts['--force'] = null;

    await git.push(params?.remote || 'origin', params?.branch || undefined, opts);
    return { message: `Pushed to ${params?.remote || 'origin'}` };
  }

  /**
   * Pull changes from remote
   * @param path Repository path {@default .}
   * @param remote Remote name {@default origin}
   * @param branch Branch name (current if omitted)
   */
  async pull(params?: { path?: string; remote?: string; branch?: string }) {
    const repoPath = this._resolvePath(params?.path);
    this._validateRepo(repoPath);

    const git = simpleGit(repoPath);
    const result = await git.pull(params?.remote || 'origin', params?.branch || undefined);

    return {
      message: `Pulled ${result.files.length} file(s)`,
      insertions: result.insertions,
      deletions: result.deletions,
    };
  }

  private _resolvePath(path?: string): string {
    if (path) {
      return resolve(path);
    }
    return this.defaultRepoPath;
  }

  private _validateRepo(repoPath: string): void {
    if (!existsSync(repoPath)) {
      throw new Error(`Path does not exist: ${repoPath}`);
    }
    const gitDir = resolve(repoPath, '.git');
    if (!existsSync(gitDir)) {
      throw new Error(`Not a git repo: ${repoPath}`);
    }
  }
}
