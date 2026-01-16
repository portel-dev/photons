/**
 * Git - Local git repository operations
 *
 * Provides git version control operations for local repositories using simple-git.
 * Supports branch management, commits, staging, and remote operations.
 *
 * Common use cases:
 * - Version control: "Show git status", "Commit these changes"
 * - Branch management: "Create a feature branch", "Switch to main"
 * - History: "Show recent commits", "Show diff of changes"
 * - Remote operations: "Push to origin", "Pull latest changes"
 *
 * Example: status({ path: "/path/to/repo" })
 *
 * Configuration:
 * - repoPath: Default repository path (default: current directory)
 *
 * @dependencies simple-git@^3.21.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import simpleGit, { SimpleGit, LogResult, StatusResult, BranchSummary } from 'simple-git';
import { existsSync } from 'fs';
import { resolve } from 'path';

export default class Git {
  private defaultRepoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.defaultRepoPath = resolve(repoPath);
  }

  async onInitialize() {
    // Photon ready
  }

  /**
   * Get git status of repository
   * @param path Repository path (default: configured repoPath)
   */
  async status(params?: { path?: string }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);
      const status: StatusResult = await git.status();

      return {
        success: true,
        path: repoPath,
        branch: status.current,
        ahead: status.ahead,
        behind: status.behind,
        staged: status.staged,
        modified: status.modified,
        deleted: status.deleted,
        created: status.created,
        renamed: status.renamed,
        conflicted: status.conflicted,
        not_added: status.not_added,
        isClean: status.isClean(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * View commit history
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param maxCount {@min 1} {@max 100} Maximum number of commits to retrieve (default: 10)
   * @param branch {@max 200} Branch name to get logs from (default: current branch) {@example main}
   */
  async log(params?: { path?: string; maxCount?: number; branch?: string }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);
      const options: any = {
        maxCount: params?.maxCount || 10,
      };

      if (params?.branch) {
        options.from = params.branch;
      }

      const log: LogResult = await git.log(options);

      return {
        success: true,
        path: repoPath,
        total: log.total,
        commits: log.all.map((commit) => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Show differences in repository
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param staged Show staged changes only (default: false)
   * @param file {@max 500} Specific file to show diff for (optional)
   */
  async diff(params?: { path?: string; staged?: boolean; file?: string }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      const options: string[] = [];
      if (params?.staged) {
        options.push('--cached');
      }
      if (params?.file) {
        options.push('--', params.file);
      }

      const diff = await git.diff(options);

      return {
        success: true,
        path: repoPath,
        staged: params?.staged || false,
        file: params?.file,
        diff,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all branches in repository
   * @param path Repository path (default: configured repoPath)
   */
  async branches(params?: { path?: string }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);
      const branches: BranchSummary = await git.branch();

      return {
        success: true,
        path: repoPath,
        current: branches.current,
        all: branches.all,
        branches: Object.keys(branches.branches).map((name) => ({
          name,
          current: branches.branches[name].current,
          commit: branches.branches[name].commit,
          label: branches.branches[name].label,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new branch
   * @param name {@min 1} {@max 200} Branch name to create {@example feature/new-feature}
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param checkout Checkout the new branch after creation (default: false)
   */
  async branch(params: { name: string; path?: string; checkout?: boolean }) {
    try {
      const repoPath = this._resolvePath(params.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      if (params.checkout) {
        await git.checkoutLocalBranch(params.name);
      } else {
        await git.branch([params.name]);
      }

      return {
        success: true,
        path: repoPath,
        branch: params.name,
        checkedOut: params.checkout || false,
        message: `Branch '${params.name}' created successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Checkout (switch to) a branch
   * @param name {@min 1} {@max 200} Branch name to checkout {@example main}
   * @param path {@max 500} Repository path (default: configured repoPath)
   */
  async checkout(params: { name: string; path?: string }) {
    try {
      const repoPath = this._resolvePath(params.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);
      await git.checkout(params.name);

      return {
        success: true,
        path: repoPath,
        branch: params.name,
        message: `Switched to branch '${params.name}'`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a branch
   * @param name {@min 1} {@max 200} Branch name to delete {@example old-feature}
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param force Force delete even if not fully merged (default: false)
   */
  async removeBranch(params: { name: string; path?: string; force?: boolean }) {
    try {
      const repoPath = this._resolvePath(params.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      if (params.force) {
        await git.deleteLocalBranch(params.name, true);
      } else {
        await git.deleteLocalBranch(params.name);
      }

      return {
        success: true,
        path: repoPath,
        branch: params.name,
        forced: params.force || false,
        message: `Branch '${params.name}' deleted successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Stage files for commit
   * @param files {@min 1} Array of file paths to stage (use '.' for all files) {@example ["src/index.ts","README.md"]}
   * @param path {@max 500} Repository path (default: configured repoPath)
   */
  async add(params: { files: string[]; path?: string }) {
    try {
      const repoPath = this._resolvePath(params.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);
      await git.add(params.files);

      return {
        success: true,
        path: repoPath,
        files: params.files,
        message: `Staged ${params.files.length} file(s)`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a commit
   * @param message {@min 1} {@max 500} Commit message {@example fix: resolve authentication bug}
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param author {@max 200} Optional author override (format: "Name <email>")
   */
  async commit(params: { message: string; path?: string; author?: string }) {
    try {
      const repoPath = this._resolvePath(params.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      const options: any = {};
      if (params.author) {
        options['--author'] = params.author;
      }

      const result = await git.commit(params.message, undefined, options);

      return {
        success: true,
        path: repoPath,
        commit: result.commit,
        branch: result.branch,
        summary: result.summary,
        message: `Commit created: ${result.commit}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Push commits to remote repository
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param remote {@max 200} Remote name (default: 'origin') {@example origin}
   * @param branch {@max 200} Branch name (default: current branch) {@example main}
   * @param force Force push (default: false)
   */
  async push(params?: { path?: string; remote?: string; branch?: string; force?: boolean }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      const remote = params?.remote || 'origin';
      const branch = params?.branch || undefined; // undefined uses current branch

      const options: any = {};
      if (params?.force) {
        options['--force'] = null;
      }

      await git.push(remote, branch, options);

      return {
        success: true,
        path: repoPath,
        remote,
        branch: branch || 'current',
        forced: params?.force || false,
        message: `Pushed to ${remote}${branch ? `/${branch}` : ''}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pull changes from remote repository
   * @param path {@max 500} Repository path (default: configured repoPath)
   * @param remote {@max 200} Remote name (default: 'origin') {@example origin}
   * @param branch {@max 200} Branch name (default: current branch) {@example main}
   */
  async pull(params?: { path?: string; remote?: string; branch?: string }) {
    try {
      const repoPath = this._resolvePath(params?.path);
      this._validateRepo(repoPath);

      const git = simpleGit(repoPath);

      const remote = params?.remote || 'origin';
      const branch = params?.branch || undefined; // undefined uses current branch

      const result = await git.pull(remote, branch);

      return {
        success: true,
        path: repoPath,
        remote,
        branch: branch || 'current',
        summary: result.summary,
        files: result.files,
        insertions: result.insertions,
        deletions: result.deletions,
        message: `Pulled from ${remote}${branch ? `/${branch}` : ''}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private helper methods

  private _resolvePath(path?: string): string {
    if (path) {
      return resolve(path);
    }
    return this.defaultRepoPath;
  }

  private _validateRepo(repoPath: string): void {
    if (!existsSync(repoPath)) {
      throw new Error(`Repository path does not exist: ${repoPath}`);
    }

    const gitDir = resolve(repoPath, '.git');
    if (!existsSync(gitDir)) {
      throw new Error(`Not a git repository: ${repoPath}`);
    }
  }

  // ========== TESTS ==========

  /** Test git status */
  async testStatus() {
    const result = await this.status();
    if (!result.success) throw new Error(result.error);
    if (!result.branch) throw new Error('Missing branch');
    return { passed: true };
  }

  /** Test git log */
  async testLog() {
    const result = await this.log({ limit: 5 });
    if (!result.success) throw new Error(result.error);
    if (!Array.isArray(result.commits)) throw new Error('Commits should be array');
    return { passed: true };
  }

  /** Test git diff */
  async testDiff() {
    const result = await this.diff();
    if (!result.success) throw new Error(result.error);
    // diff can be empty string, that's ok
    if (typeof result.diff !== 'string') throw new Error('Diff should be string');
    return { passed: true };
  }

  /** Test git branches */
  async testBranches() {
    const result = await this.branches();
    if (!result.success) throw new Error(result.error);
    if (!Array.isArray(result.branches)) throw new Error('Branches should be array');
    if (!result.current) throw new Error('Missing current branch');
    return { passed: true };
  }

  /** Test git show */
  async testShow() {
    const logResult = await this.log({ limit: 1 });
    if (!logResult.success || !logResult.commits?.length) {
      return { skipped: true, reason: 'No commits in repo' };
    }
    const result = await this.show({ ref: logResult.commits[0].hash });
    if (!result.success) throw new Error(result.error);
    if (!result.commit) throw new Error('Missing commit info');
    return { passed: true };
  }
}
