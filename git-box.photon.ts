import { PhotonMCP, io } from '@portel/photon-core';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
// Fix: use trimEnd() instead of trim() to preserve git status leading whitespace
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * @name git-box
 * @icon 📬
 * @description Mailbox-style Git interface - manage repos like an inbox
 * @version 2.0.0
 * @cli git - https://git-scm.com/downloads
 *
 * ## Quick Reference
 *
 * ### Repository Management
 * | Method | Description |
 * |--------|-------------|
 * | `repos` | List all tracked repositories |
 * | `repoAdd` | Add a repository to track |
 * | `repoRemove` | Remove a repository from tracking |
 * | `repoInit` | Initialize a new git repository |
 * | `availableRepos` | Scan projects folder for repos |
 * | `projectsRootSet` | Set the projects root folder |
 *
 * ### Working Tree
 * | Method | Description |
 * |--------|-------------|
 * | `status` | Get staged/unstaged/untracked files |
 * | `fileStage` | Stage a file for commit |
 * | `fileUnstage` | Unstage a file |
 * | `changesDiscard` | Discard changes in a file |
 * | `diff` | Get diff for a file |
 * | `fileContent` | Get file content |
 *
 * ### Commits
 * | Method | Description |
 * |--------|-------------|
 * | `commits` | Get commit history |
 * | `commitFiles` | Get files changed in a commit |
 * | `commitDiff` | Get diff for a file in a commit |
 * | `commit` | Create a commit |
 * | `commitRevert` | Revert a commit |
 * | `commitReset` | Reset to a commit |
 * | `commitRecover` | Recover a lost commit |
 * | `commitFixup` | Amend staged changes into older commit |
 * | `commitMessageAmend` | Amend an older commit's message |
 * | `commitsSquash` | Squash multiple commits |
 * | `commitsSearch` | Search commits |
 *
 * ### Branches
 * | Method | Description |
 * |--------|-------------|
 * | `branches` | List all branches |
 * | `branchCreate` | Create a new branch |
 * | `branchCreateSwitch` | Create and switch to branch |
 * | `branchSwitch` | Switch to a branch |
 * | `branchDelete` | Delete a branch |
 * | `branchMerge` | Merge a branch |
 * | `mergeAbort` | Abort an in-progress merge |
 *
 * ### Remote Operations
 * | Method | Description |
 * |--------|-------------|
 * | `pull` | Pull changes from remote |
 * | `push` | Push changes to remote |
 * | `fetch` | Fetch updates from remote |
 *
 * ### Stash
 * | Method | Description |
 * |--------|-------------|
 * | `stashes` | List all stashes |
 * | `stashCreate` | Create a stash |
 * | `stashApply` | Apply a stash (keep it) |
 * | `stashPop` | Apply and remove a stash |
 * | `stashDrop` | Delete a stash |
 * | `stashShow` | Show stash diff |
 * | `stashesClear` | Clear all stashes |
 *
 * ### History & Undo
 * | Method | Description |
 * |--------|-------------|
 * | `reflog` | Get git operation history |
 * | `undoLast` | Undo last git operation |
 * | `blame` | Get blame info for file |
 * | `changeFind` | Find commit that introduced change |
 *
 * ### Rebase & Cherry-pick
 * | Method | Description |
 * |--------|-------------|
 * | `rebasePreview` | Preview commits to rebase |
 * | `rebaseScripted` | Perform scripted rebase |
 * | `rebaseContinue` | Continue rebase |
 * | `rebaseAbort` | Abort rebase |
 * | `cherryPick` | Cherry-pick commits |
 * | `cherryPickContinue` | Continue cherry-pick |
 * | `cherryPickAbort` | Abort cherry-pick |
 * | `revertAbort` | Abort revert |
 *
 * ### Conflicts
 * | Method | Description |
 * |--------|-------------|
 * | `conflicts` | Get current conflicts |
 * | `conflictResolve` | Resolve with ours/theirs |
 * | `conflictMarkResolved` | Mark file as resolved |
 *
 * ### Advanced
 * | Method | Description |
 * |--------|-------------|
 * | `fileRemoveFromHistory` | Remove file from all history |
 */
export class GitBoxPhoton extends PhotonMCP {
  private configPath = path.join(os.homedir(), '.photon', 'git-box.json');

  /**
   * Escape a string for safe shell usage
   */
  private _shellEscape(str: string): string {
    // Use single quotes and escape any single quotes within
    return `'${str.replace(/'/g, "'\\''")}'`;
  }

  /**
   * Unquote a path from git's porcelain/status output.
   * Git wraps paths containing spaces or special chars in double quotes
   * and backslash-escapes quotes and backslashes within.
   */
  private _unquoteGitPath(p: string): string {
    if (p.startsWith('"') && p.endsWith('"')) {
      return p.slice(1, -1)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
    }
    return p;
  }

  /**
   * Validate that a string is a safe git ref name (branch, tag, etc.)
   */
  private _isValidRefName(name: string): boolean {
    // Reject obvious command injection attempts
    if (name.startsWith('-')) return false;
    if (name.includes('..')) return false;
    if (/[;\$`|&<>]/.test(name)) return false;
    return true;
  }

  /**
   * Opens the mailbox interface for managing git repositories.
   * Displays tracked repos with their status, commit history, and working changes.
   * @ui mailbox
   */
  async main() {
    const repos = await this.repos();
    return { repos };
  }

  private _loadConfig(): { repos: string[]; projectsRoot?: string } {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      }
      // Migration: check for old config file
      const oldConfigPath = path.join(os.homedir(), '.photon', 'git-mailbox.json');
      if (fs.existsSync(oldConfigPath)) {
        const config = JSON.parse(fs.readFileSync(oldConfigPath, 'utf-8'));
        this._saveConfig(config);
        return config;
      }
    } catch {}
    return { repos: [], projectsRoot: path.join(os.homedir(), 'Projects') };
  }

  private _saveConfig(config: { repos: string[]; projectsRoot?: string }) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  private async _runGit(repoPath: string, command: string, maxBuffer?: number): Promise<string> {
    try {
      const options = maxBuffer ? { maxBuffer } : { maxBuffer: 10 * 1024 * 1024 }; // 10MB default
      const { stdout } = await execAsync(`git -C ${this._shellEscape(repoPath)} ${command}`, options);
      // Use trimEnd() to preserve leading whitespace (important for git status --porcelain format)
      return stdout.trimEnd();
    } catch (error: any) {
      if (error.stdout) return error.stdout.trimEnd();
      throw error;
    }
  }

  /**
   * Find immediate child folders that are git repositories
   */
  private _findChildGitRepos(folderPath: string): Array<{ name: string; path: string }> {
    const results: Array<{ name: string; path: string }> = [];
    try {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const childPath = path.join(folderPath, entry.name);
        if (fs.existsSync(path.join(childPath, '.git'))) {
          results.push({ name: entry.name, path: childPath });
        }
      }
    } catch {}
    return results;
  }

  /**
   * Add a repository to track — prompts interactively if the folder isn't a git repo
   * @param repoPath Path to git repository
   */
  async *repoAdd(params: { repoPath: string }): AsyncGenerator<any> {
    const fullPath = path.resolve(params.repoPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Path does not exist: ${fullPath}`);
    }

    const isGitRepo = fs.existsSync(path.join(fullPath, '.git'));

    if (!isGitRepo) {
      // Check if this folder is inside another git repo
      const parentRepo = this._findParentGitRepo(fullPath);

      if (parentRepo) {
        const useParent: boolean = yield io.ask.confirm(
          `"${path.basename(fullPath)}" is inside another git repository: ${path.basename(parentRepo)}. Add the parent repo instead?`,
          { default: true }
        );

        if (useParent) {
          return yield* this._addRepoToConfig(parentRepo, false);
        }
        return { added: false, cancelled: true };
      }

      // Check for child git repos
      const childRepos = this._findChildGitRepos(fullPath);

      if (childRepos.length > 0) {
        const options = [
          `Initialize "${path.basename(fullPath)}" as a new git repo`,
          ...childRepos.map(r => `Add subfolder: ${r.name} (existing git repo)`)
        ];

        const choice: string = yield io.ask.select(
          `"${path.basename(fullPath)}" is not a git repository, but it contains ${childRepos.length} git repo(s) inside. What would you like to do?`,
          options
        );

        if (choice === options[0]) {
          // Initialize this folder
          await this._runGit(fullPath, 'init');
          this.emit({ emit: 'toast', message: `Initialized git repo: ${path.basename(fullPath)}`, type: 'success' });
          return yield* this._addRepoToConfig(fullPath, true);
        } else {
          // Find which child repo was selected
          const idx = options.indexOf(choice) - 1;
          if (idx >= 0 && idx < childRepos.length) {
            return yield* this._addRepoToConfig(childRepos[idx].path, false);
          }
          return { added: false, cancelled: true };
        }
      }

      // No children, no parent — just a plain folder
      const shouldInit: boolean = yield io.ask.confirm(
        `"${path.basename(fullPath)}" is not a git repository. Initialize it as one?`,
        { default: true }
      );

      if (!shouldInit) {
        return { added: false, cancelled: true };
      }

      await this._runGit(fullPath, 'init');
      this.emit({ emit: 'toast', message: `Initialized git repo: ${path.basename(fullPath)}`, type: 'success' });
      return yield* this._addRepoToConfig(fullPath, true);
    }

    return yield* this._addRepoToConfig(fullPath, false);
  }

  /**
   * Helper to add a repo path to config and return result
   */
  private async *_addRepoToConfig(fullPath: string, initialized: boolean): AsyncGenerator<any> {
    const config = this._loadConfig();
    if (!config.repos.includes(fullPath)) {
      config.repos.push(fullPath);
      this._saveConfig(config);
    }
    return { added: fullPath, total: config.repos.length, initialized };
  }

  /**
   * Check if a folder is inside a git repository
   */
  private _findParentGitRepo(folderPath: string): string | null {
    let current = path.dirname(folderPath); // Start from parent, not the folder itself

    while (current !== path.dirname(current)) { // Stop at filesystem root
      if (fs.existsSync(path.join(current, '.git'))) {
        return current;
      }
      current = path.dirname(current);
    }

    return null;
  }

  /**
   * Initialize a new git repository
   * @param folderPath Path to folder
   * @param force Skip safety checks
   */
  async repoInit(params: { folderPath: string; force?: boolean }) {
    const fullPath = path.resolve(params.folderPath);
    const { force = false } = params;

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Path does not exist: ${fullPath}`);
    }

    // Already a git repo?
    if (fs.existsSync(path.join(fullPath, '.git'))) {
      return { initialized: false, alreadyRepo: true };
    }

    // Check for parent repo
    if (!force) {
      const parentRepo = this._findParentGitRepo(fullPath);
      if (parentRepo) {
        return {
          initialized: false,
          insideRepo: parentRepo,
          error: `This folder is inside: ${parentRepo}`,
          useForce: 'Set force=true to create nested repo (not recommended)'
        };
      }
    }

    await this._runGit(fullPath, 'init');
    this.emit({ emit: 'toast', message: `Initialized: ${path.basename(fullPath)}`, type: 'success' });

    return { initialized: true, path: fullPath };
  }

  /**
   * Scan projects root folder for available git repositories and folders
   */
  async availableRepos() {
    const config = this._loadConfig();
    const projectsRoot = config.projectsRoot || path.join(os.homedir(), 'Projects');
    const available: Array<{
      name: string;
      path: string;
      alreadyAdded: boolean;
      isGitRepo: boolean;
      canInit: boolean;
    }> = [];

    if (!fs.existsSync(projectsRoot)) {
      return { projectsRoot, available, error: `Projects root not found: ${projectsRoot}` };
    }

    try {
      const entries = fs.readdirSync(projectsRoot, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.')) continue; // Skip hidden folders
        if (entry.name === 'node_modules') continue; // Skip node_modules

        const folderPath = path.join(projectsRoot, entry.name);
        const gitPath = path.join(folderPath, '.git');
        const isGitRepo = fs.existsSync(gitPath);

        // Check if this folder is inside another repo (shouldn't init there)
        const parentRepo = this._findParentGitRepo(folderPath);
        const canInit = !isGitRepo && !parentRepo;

        available.push({
          name: entry.name,
          path: folderPath,
          alreadyAdded: config.repos.includes(folderPath),
          isGitRepo,
          canInit
        });
      }
    } catch (error: any) {
      return { projectsRoot, available, error: error.message };
    }

    // Sort: git repos first, then alphabetically
    available.sort((a, b) => {
      if (a.isGitRepo !== b.isGitRepo) return a.isGitRepo ? -1 : 1;
      if (a.alreadyAdded !== b.alreadyAdded) return a.alreadyAdded ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return { projectsRoot, available };
  }

  /**
   * Set the projects root folder
   * @param rootPath Path to folder containing git repositories
   */
  async projectsRootSet(params: { rootPath: string }) {
    const fullPath = path.resolve(params.rootPath.replace(/^~/, os.homedir()));

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Path does not exist: ${fullPath}`);
    }

    const config = this._loadConfig();
    config.projectsRoot = fullPath;
    this._saveConfig(config);

    return { projectsRoot: fullPath };
  }

  /**
   * Remove a repository from tracking
   * @param repoPath Path to git repository
   */
  async repoRemove(params: { repoPath: string }) {
    const fullPath = path.resolve(params.repoPath);
    const config = this._loadConfig();
    config.repos = config.repos.filter(r => r !== fullPath);
    this._saveConfig(config);
    return { removed: fullPath, remaining: config.repos.length };
  }

  /**
   * List all tracked repositories with status counts
   */
  async repos() {
    const config = this._loadConfig();

    // Fetch status for all repos in parallel for better performance
    const repoPromises = config.repos
      .filter(repoPath => fs.existsSync(repoPath))
      .map(async (repoPath) => {
        try {
          const name = path.basename(repoPath);
          const branch = await this._runGit(repoPath, 'rev-parse --abbrev-ref HEAD');

          // Count uncommitted changes (avoid -uall flag for large repos)
          const status = await this._runGit(repoPath, 'status --porcelain');
          const uncommitted = status ? status.split('\n').filter(Boolean).length : 0;

          // Count unpushed commits
          let unpushed = 0;
          try {
            const ahead = await this._runGit(repoPath, 'rev-list --count @{u}..HEAD');
            unpushed = parseInt(ahead) || 0;
          } catch {
            // No upstream configured
          }

          return {
            path: repoPath,
            name,
            branch,
            uncommitted,
            unpushed,
            badge: uncommitted + unpushed,
          };
        } catch {
          return {
            path: repoPath,
            name: path.basename(repoPath),
            error: 'Failed to read repository',
          };
        }
      });

    return Promise.all(repoPromises);
  }

  /**
   * Get commit history for a repository (like inbox messages)
   * @param repoPath Path to repository
   * @param limit Number of commits to fetch
   * @param branch Branch to show commits from
   */
  async commits(params: { repoPath: string; limit?: number; branch?: string }) {
    const { repoPath, limit = 50, branch } = params;
    const branchArg = branch || 'HEAD';

    // Validate branch name to prevent command injection
    if (branch && !this._isValidRefName(branch)) {
      throw new Error(`Invalid branch name: ${branch}`);
    }

    const format = '%H|%h|%an|%ae|%at|%s';
    const output = await this._runGit(repoPath, `log ${this._shellEscape(branchArg)} -n ${limit} --format="${format}"`);

    if (!output) return [];

    // Get set of unpushed commit hashes
    let unpushedHashes = new Set<string>();
    try {
      const unpushedOutput = await this._runGit(repoPath, 'rev-list @{u}..HEAD');
      if (unpushedOutput) {
        unpushedHashes = new Set(unpushedOutput.split('\n').filter(Boolean));
      }
    } catch {
      // No upstream configured — treat all as unknown (pushed: true to avoid false amber)
    }

    return output.split('\n').map(line => {
      const parts = line.split('|');
      const [hash, shortHash, author, email, timestamp] = parts;
      const subject = parts.slice(5).join('|'); // Subject may contain |
      return {
        hash,
        shortHash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1000).toISOString(),
        subject,
        pushed: !unpushedHashes.has(hash),
      };
    });
  }

  /**
   * Get files changed in a specific commit
   * @param repoPath Path to repository
   * @param hash Commit hash
   */
  async commitFiles(params: { repoPath: string; hash: string }) {
    const { repoPath, hash } = params;

    const output = await this._runGit(repoPath, `diff-tree --no-commit-id --name-status -r ${hash}`);
    if (!output) return [];

    return output.split('\n').map(line => {
      const [status, ...pathParts] = line.split('\t');
      const filePath = this._unquoteGitPath(pathParts.join('\t'));

      const statusMap: Record<string, string> = {
        'A': 'added',
        'M': 'modified',
        'D': 'deleted',
        'R': 'renamed',
        'C': 'copied',
      };

      return {
        path: filePath,
        status: statusMap[status.charAt(0)] || status,
      };
    });
  }

  /**
   * Get current working tree status (staged and unstaged changes)
   * @param repoPath Path to repository
   */
  async status(params: { repoPath: string }) {
    const { repoPath } = params;

    // Note: Avoid -uall flag as it can cause memory issues on large repos
    const output = await this._runGit(repoPath, 'status --porcelain');
    if (!output) return { staged: [], unstaged: [], untracked: [] };

    const staged: any[] = [];
    const unstaged: any[] = [];
    const untracked: any[] = [];

    for (const line of output.split('\n')) {
      if (!line) continue;

      const indexStatus = line.charAt(0);
      const workStatus = line.charAt(1);
      // Git porcelain format: XY PATH (XY are 2 status chars, then space, then path)
      // The third char is always a space, so slice from position 3
      // Git quotes paths with spaces/special chars — unquote them
      const filePath = this._unquoteGitPath(line.slice(3));

      const statusMap: Record<string, string> = {
        'A': 'added',
        'M': 'modified',
        'D': 'deleted',
        'R': 'renamed',
        '?': 'untracked',
      };

      if (indexStatus === '?') {
        untracked.push({ path: filePath, status: 'untracked' });
      } else {
        if (indexStatus !== ' ') {
          staged.push({ path: filePath, status: statusMap[indexStatus] || indexStatus });
        }
        if (workStatus !== ' ' && workStatus !== '?') {
          unstaged.push({ path: filePath, status: statusMap[workStatus] || workStatus });
        }
      }
    }

    // Filter out deleted symlinks (e.g. symlinked directories) — they can't be diffed
    const filterSymlinks = async (files: any[]) => {
      const result: any[] = [];
      for (const f of files) {
        if (f.status === 'deleted') {
          try {
            const mode = await this._runGit(repoPath, `ls-files -s -- ${this._shellEscape(f.path)}`);
            if (mode.startsWith('120000')) continue; // symlink — skip
          } catch { /* keep it if check fails */ }
        }
        result.push(f);
      }
      return result;
    };

    return {
      staged: await filterSymlinks(staged),
      unstaged: await filterSymlinks(unstaged),
      untracked,
    };
  }

  /**
   * Stage a file for commit
   * @param repoPath Path to repository
   * @param filePath File to stage (or "." for all)
   */
  async fileStage(params: { repoPath: string; filePath: string }) {
    await this._runGit(params.repoPath, `add -- ${this._shellEscape(params.filePath)}`);
    this.emit({ emit: 'status', message: `Staged: ${params.filePath}` });
    return { staged: params.filePath };
  }

  /**
   * Unstage a file
   * @param repoPath Path to repository
   * @param filePath File to unstage
   */
  async fileUnstage(params: { repoPath: string; filePath: string }) {
    await this._runGit(params.repoPath, `reset HEAD -- ${this._shellEscape(params.filePath)}`);
    this.emit({ emit: 'status', message: `Unstaged: ${params.filePath}` });
    return { unstaged: params.filePath };
  }

  /**
   * Create a commit with staged changes
   * @param repoPath Path to repository
   * @param message Commit message
   */
  async commit(params: { repoPath: string; message: string }) {
    const { repoPath, message } = params;

    // Check if there are staged changes
    const st = await this.status({ repoPath });
    if (st.staged.length === 0) {
      throw new Error('No staged changes to commit');
    }

    await this._runGit(repoPath, `commit -m ${this._shellEscape(message)}`);

    this.emit({ emit: 'toast', message: 'Commit created!', type: 'success' });
    return {
      committed: true,
      message,
      files: st.staged.length
    };
  }

  /**
   * Pull changes from remote
   * @param repoPath Path to repository
   * @param remote Remote name (default: origin)
   */
  async pull(params: { repoPath: string; remote?: string }) {
    const { repoPath, remote = 'origin' } = params;
    this.emit({ emit: 'status', message: 'Pulling...' });

    const output = await this._runGit(repoPath, `pull ${remote}`);
    this.emit({ emit: 'toast', message: 'Pull complete!', type: 'success' });

    return { output };
  }

  /**
   * Push changes to remote
   * @param repoPath Path to repository
   * @param remote Remote name (default: origin)
   */
  async push(params: { repoPath: string; remote?: string }) {
    const { repoPath, remote = 'origin' } = params;
    this.emit({ emit: 'status', message: 'Pushing...' });

    const branch = await this._runGit(repoPath, 'rev-parse --abbrev-ref HEAD');
    const output = await this._runGit(repoPath, `push ${remote} ${branch}`);
    this.emit({ emit: 'toast', message: 'Push complete!', type: 'success' });

    return { output, branch };
  }

  /**
   * Fetch updates from remote without merging
   * @param repoPath Path to repository
   * @param remote Remote name (default: origin)
   * @param prune Remove remote-tracking references that no longer exist
   */
  async fetch(params: { repoPath: string; remote?: string; prune?: boolean }) {
    const { repoPath, remote = 'origin', prune = true } = params;
    this.emit({ emit: 'status', message: 'Fetching...' });

    const pruneArg = prune ? ' --prune' : '';
    const output = await this._runGit(repoPath, `fetch ${remote}${pruneArg}`);
    this.emit({ emit: 'toast', message: 'Fetch complete!', type: 'success' });

    return { output };
  }

  /**
   * Get list of branches
   * @param repoPath Path to repository
   */
  async branches(params: { repoPath: string }) {
    const { repoPath } = params;

    // Use a delimiter unlikely to appear in branch names
    const output = await this._runGit(repoPath, 'branch -a --format="%(refname:short)\t%(objectname:short)\t%(upstream:track)"');
    const current = await this._runGit(repoPath, 'rev-parse --abbrev-ref HEAD');

    const branches = output.split('\n').filter(Boolean).map(line => {
      const [name, hash, track] = line.split('\t');
      return {
        name,
        hash,
        current: name === current,
        track: track || null,
      };
    });

    return { current, branches };
  }

  /**
   * Switch to a different branch
   * @param repoPath Path to repository
   * @param branch Branch name to switch to
   */
  async branchSwitch(params: { repoPath: string; branch: string }) {
    const { repoPath, branch } = params;
    if (!this._isValidRefName(branch)) {
      throw new Error(`Invalid branch name: ${branch}`);
    }
    await this._runGit(repoPath, `checkout ${this._shellEscape(branch)}`);
    this.emit({ emit: 'toast', message: `Switched to ${branch}`, type: 'success' });
    return { branch };
  }

  /**
   * Get diff for a file with syntax-highlighted output
   * @param repoPath Path to repository
   * @param filePath File to diff
   * @param staged Whether to show staged diff
   */
  async diff(params: { repoPath: string; filePath: string; staged?: boolean }) {
    const { repoPath, filePath, staged = false } = params;
    const stageArg = staged ? '--cached' : '';
    const diff = await this._runGit(repoPath, `diff ${stageArg} -- ${this._shellEscape(filePath)}`);

    // Detect binary files
    const isBinary = diff.includes('Binary files') && diff.includes('differ');

    // Split into lines for easier rendering
    const lines = diff ? diff.split('\n') : [];

    return {
      diff,
      lines,
      filePath,
      staged,
      isBinary,
    };
  }

  /**
   * Discard changes in a file
   * @param repoPath Path to repository
   * @param filePath File to discard changes
   */
  async changesDiscard(params: { repoPath: string; filePath: string }) {
    const { repoPath, filePath } = params;
    const escapedPath = this._shellEscape(filePath);
    // Check if file is tracked
    try {
      await this._runGit(repoPath, `ls-files --error-unmatch ${escapedPath}`);
      // Tracked file — restore from HEAD
      await this._runGit(repoPath, `checkout -- ${escapedPath}`);
    } catch {
      // Untracked file — delete it
      const fullPath = path.join(repoPath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    this.emit({ emit: 'toast', message: `Discarded: ${filePath}`, type: 'info' });
    return { discarded: filePath };
  }

  /**
   * Get diff for a specific file in a commit
   * @param repoPath Path to repository
   * @param hash Commit hash
   * @param filePath File to get diff for
   */
  async commitDiff(params: { repoPath: string; hash: string; filePath: string }) {
    const { repoPath, hash, filePath } = params;
    // Show diff between this commit and its parent
    const diff = await this._runGit(repoPath, `show ${hash} -- ${this._shellEscape(filePath)}`);
    const isBinary = diff.includes('Binary files') && diff.includes('differ');
    const lines = diff ? diff.split('\n') : [];

    return {
      diff,
      lines,
      hash,
      filePath,
      isBinary,
    };
  }

  /**
   * Get file content (current version or from a specific commit)
   * @param repoPath Path to repository
   * @param filePath File to read
   * @param hash Optional commit hash (omit for working tree version)
   */
  async fileContent(params: { repoPath: string; filePath: string; hash?: string }) {
    const { repoPath, filePath, hash } = params;

    let content: string;
    if (hash) {
      // Get file from specific commit
      content = await this._runGit(repoPath, `show ${hash}:${this._shellEscape(filePath)}`);
    } else {
      // Get current working tree version
      const fullPath = path.join(repoPath, filePath);
      if (!fs.existsSync(fullPath)) {
        // File may be deleted or renamed — try reading from git HEAD
        try {
          content = await this._runGit(repoPath, `show HEAD:${this._shellEscape(filePath)}`);
        } catch {
          throw new Error(`File not found: ${filePath} (may have been deleted or renamed)`);
        }
      } else {
        content = fs.readFileSync(fullPath, 'utf-8');
      }
    }

    // Detect binary files by extension
    const binaryExts = new Set([
      'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg', 'avif',
      'mp3', 'mp4', 'wav', 'ogg', 'webm', 'mov', 'avi',
      'pdf', 'zip', 'gz', 'tar', 'rar', '7z',
      'woff', 'woff2', 'ttf', 'otf', 'eot',
      'exe', 'dll', 'so', 'dylib', 'o', 'a',
    ]);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const isBinary = binaryExts.has(ext);
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg', 'avif'].includes(ext);

    if (isBinary) {
      return {
        content: '',
        lines: [],
        filePath,
        language: 'binary',
        isBinary: true,
        isImage,
      };
    }

    // Detect language from extension for syntax highlighting hints
    const langMap: Record<string, string> = {
      'ts': 'typescript', 'tsx': 'typescript', 'js': 'javascript', 'jsx': 'javascript',
      'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'java': 'java',
      'c': 'c', 'cpp': 'cpp', 'h': 'c', 'hpp': 'cpp', 'cs': 'csharp',
      'php': 'php', 'swift': 'swift', 'kt': 'kotlin', 'scala': 'scala',
      'html': 'html', 'css': 'css', 'scss': 'scss', 'less': 'less',
      'json': 'json', 'yaml': 'yaml', 'yml': 'yaml', 'xml': 'xml',
      'md': 'markdown', 'sql': 'sql', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash',
    };

    return {
      content,
      lines: content.split('\n'),
      filePath,
      language: langMap[ext] || 'plaintext'
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BRANCH OPERATIONS (#4)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new branch
   * @param repoPath Path to repository
   * @param branchName Name for the new branch
   * @param startPoint Optional commit/branch to start from (default: HEAD)
   */
  async branchCreate(params: { repoPath: string; branchName: string; startPoint?: string }) {
    const { repoPath, branchName, startPoint } = params;
    if (!this._isValidRefName(branchName)) {
      throw new Error(`Invalid branch name: ${branchName}`);
    }
    if (startPoint && !this._isValidRefName(startPoint)) {
      throw new Error(`Invalid start point: ${startPoint}`);
    }
    const startArg = startPoint ? ` ${this._shellEscape(startPoint)}` : '';
    await this._runGit(repoPath, `branch ${this._shellEscape(branchName)}${startArg}`);
    this.emit({ emit: 'toast', message: `Created branch: ${branchName}`, type: 'success' });
    return { created: branchName };
  }

  /**
   * Create and switch to a new branch
   * @param repoPath Path to repository
   * @param branchName Name for the new branch
   * @param startPoint Optional commit/branch to start from
   */
  async branchCreateSwitch(params: { repoPath: string; branchName: string; startPoint?: string }) {
    const { repoPath, branchName, startPoint } = params;
    if (!this._isValidRefName(branchName)) {
      throw new Error(`Invalid branch name: ${branchName}`);
    }
    if (startPoint && !this._isValidRefName(startPoint)) {
      throw new Error(`Invalid start point: ${startPoint}`);
    }
    const startArg = startPoint ? ` ${this._shellEscape(startPoint)}` : '';
    await this._runGit(repoPath, `checkout -b ${this._shellEscape(branchName)}${startArg}`);
    this.emit({ emit: 'toast', message: `Created and switched to: ${branchName}`, type: 'success' });
    return { created: branchName, switched: true };
  }

  /**
   * Delete a branch
   * @param repoPath Path to repository
   * @param branchName Branch to delete
   * @param force Force delete even if not merged
   */
  async branchDelete(params: { repoPath: string; branchName: string; force?: boolean }) {
    const { repoPath, branchName, force = false } = params;
    if (!this._isValidRefName(branchName)) {
      throw new Error(`Invalid branch name: ${branchName}`);
    }
    const flag = force ? '-D' : '-d';
    await this._runGit(repoPath, `branch ${flag} ${this._shellEscape(branchName)}`);
    this.emit({ emit: 'toast', message: `Deleted branch: ${branchName}`, type: 'info' });
    return { deleted: branchName };
  }

  /**
   * Merge a branch into the current branch
   * @param repoPath Path to repository
   * @param branchName Branch to merge
   * @param noFastForward Create merge commit even if fast-forward is possible
   */
  async branchMerge(params: { repoPath: string; branchName: string; noFastForward?: boolean }) {
    const { repoPath, branchName, noFastForward = false } = params;
    if (!this._isValidRefName(branchName)) {
      throw new Error(`Invalid branch name: ${branchName}`);
    }
    const ffArg = noFastForward ? '--no-ff ' : '';

    try {
      const output = await this._runGit(repoPath, `merge ${ffArg}${this._shellEscape(branchName)}`);
      this.emit({ emit: 'toast', message: `Merged ${branchName}`, type: 'success' });
      return { merged: branchName, output, conflicts: false };
    } catch (error: any) {
      // Check for merge conflicts
      const status = await this._runGit(repoPath, 'status --porcelain');
      const hasConflicts = status.includes('UU') || status.includes('AA') || status.includes('DD');

      if (hasConflicts) {
        return { merged: false, conflicts: true, message: 'Merge conflicts detected' };
      }
      throw error;
    }
  }

  /**
   * Abort an in-progress merge
   * @param repoPath Path to repository
   */
  async mergeAbort(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'merge --abort');
    this.emit({ emit: 'toast', message: 'Merge aborted', type: 'info' });
    return { aborted: true };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNDO STACK (#6)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get reflog - history of all git operations (undo stack)
   * @param repoPath Path to repository
   * @param limit Number of entries to fetch
   */
  async reflog(params: { repoPath: string; limit?: number }) {
    const { repoPath, limit = 20 } = params;
    // Use tab delimiter to avoid issues with | in messages
    const format = '%H\t%h\t%gd\t%gs\t%ci';
    const output = await this._runGit(repoPath, `reflog -n ${limit} --format="${format}"`);

    if (!output) return [];

    return output.split('\n').filter(Boolean).map(line => {
      const parts = line.split('\t');
      const [hash, shortHash, ref] = parts;
      const date = parts[parts.length - 1];
      const action = parts.slice(3, -1).join('\t'); // Action may contain tabs
      return { hash, shortHash, ref, action, date };
    });
  }

  /**
   * Undo the last git operation (soft reset to previous HEAD)
   * @param repoPath Path to repository
   */
  async undoLast(params: { repoPath: string }) {
    const { repoPath } = params;

    // Get the previous HEAD from reflog
    const reflogEntries = await this.reflog({ repoPath, limit: 2 });
    if (reflogEntries.length < 2) {
      throw new Error('No previous state to undo to');
    }

    const previousState = reflogEntries[1];
    await this._runGit(repoPath, `reset --soft ${previousState.hash}`);
    this.emit({ emit: 'toast', message: `Undid: ${reflogEntries[0].action}`, type: 'success' });

    return { undone: reflogEntries[0].action, restoredTo: previousState.hash };
  }

  /**
   * Reset to a specific commit (from reflog or commit history)
   * @param repoPath Path to repository
   * @param hash Commit hash to reset to
   * @param mode Reset mode: soft (keep changes staged), mixed (keep changes unstaged), hard (discard all)
   */
  async commitReset(params: { repoPath: string; hash: string; mode?: 'soft' | 'mixed' | 'hard' }) {
    const { repoPath, hash, mode = 'soft' } = params;

    // Safety check for hard reset
    if (mode === 'hard') {
      const st = await this.status({ repoPath });
      const hasChanges = st.staged.length > 0 || st.unstaged.length > 0;
      if (hasChanges) {
        return {
          reset: false,
          warning: 'You have uncommitted changes. Use mode=hard to discard them.',
          changes: { staged: st.staged.length, unstaged: st.unstaged.length }
        };
      }
    }

    await this._runGit(repoPath, `reset --${mode} ${hash}`);
    this.emit({ emit: 'toast', message: `Reset to ${hash.slice(0, 7)} (${mode})`, type: 'success' });

    return { reset: true, hash, mode };
  }

  /**
   * Recover a "lost" commit using reflog
   * @param repoPath Path to repository
   * @param hash Commit hash to recover (create a branch pointing to it)
   * @param branchName Name for the recovery branch
   */
  async commitRecover(params: { repoPath: string; hash: string; branchName?: string }) {
    const { repoPath, hash, branchName = `recovered-${hash.slice(0, 7)}` } = params;

    await this._runGit(repoPath, `branch ${branchName} ${hash}`);
    this.emit({ emit: 'toast', message: `Recovered to branch: ${branchName}`, type: 'success' });

    return { recovered: true, branch: branchName, hash };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STASH MANAGER (#7)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List all stashes
   * @param repoPath Path to repository
   */
  async stashes(params: { repoPath: string }) {
    const { repoPath } = params;
    const output = await this._runGit(repoPath, 'stash list --format="%gd|%ci|%gs"');

    if (!output) return [];

    return output.split('\n').filter(Boolean).map((line, index) => {
      const [ref, date, message] = line.split('|');
      return { index, ref, date, message };
    });
  }

  /**
   * Create a new stash
   * @param repoPath Path to repository
   * @param message Optional stash message
   * @param includeUntracked Include untracked files
   */
  async stashCreate(params: { repoPath: string; message?: string; includeUntracked?: boolean }) {
    const { repoPath, message, includeUntracked = false } = params;

    // Check if there are changes to stash
    const st = await this.status({ repoPath });
    const hasChanges = st.staged.length > 0 || st.unstaged.length > 0 ||
                       (includeUntracked && st.untracked.length > 0);

    if (!hasChanges) {
      return { stashed: false, message: 'No changes to stash' };
    }

    const untrackedArg = includeUntracked ? '-u ' : '';
    const msgArg = message ? ` -m ${this._shellEscape(message)}` : '';

    await this._runGit(repoPath, `stash push ${untrackedArg}${msgArg}`.trim());
    this.emit({ emit: 'toast', message: 'Changes stashed', type: 'success' });

    return { stashed: true, message: message || 'WIP' };
  }

  /**
   * Apply a stash (keep the stash)
   * @param repoPath Path to repository
   * @param stashRef Stash reference (e.g., "stash@{0}") - defaults to latest
   */
  async stashApply(params: { repoPath: string; stashRef?: string }) {
    const { repoPath, stashRef = 'stash@{0}' } = params;

    try {
      await this._runGit(repoPath, `stash apply ${stashRef}`);
      this.emit({ emit: 'toast', message: `Applied: ${stashRef}`, type: 'success' });
      return { applied: true, ref: stashRef };
    } catch (error: any) {
      if (error.message?.includes('conflict')) {
        return { applied: false, conflicts: true, message: 'Conflicts while applying stash' };
      }
      throw error;
    }
  }

  /**
   * Pop a stash (apply and remove)
   * @param repoPath Path to repository
   * @param stashRef Stash reference - defaults to latest
   */
  async stashPop(params: { repoPath: string; stashRef?: string }) {
    const { repoPath, stashRef = 'stash@{0}' } = params;

    try {
      await this._runGit(repoPath, `stash pop ${stashRef}`);
      this.emit({ emit: 'toast', message: `Popped: ${stashRef}`, type: 'success' });
      return { popped: true, ref: stashRef };
    } catch (error: any) {
      if (error.message?.includes('conflict')) {
        return { popped: false, conflicts: true, message: 'Conflicts while applying stash' };
      }
      throw error;
    }
  }

  /**
   * Drop (delete) a stash
   * @param repoPath Path to repository
   * @param stashRef Stash reference to drop
   */
  async stashDrop(params: { repoPath: string; stashRef: string }) {
    const { repoPath, stashRef } = params;
    await this._runGit(repoPath, `stash drop ${stashRef}`);
    this.emit({ emit: 'toast', message: `Dropped: ${stashRef}`, type: 'info' });
    return { dropped: true, ref: stashRef };
  }

  /**
   * Show diff of a stash
   * @param repoPath Path to repository
   * @param stashRef Stash reference
   */
  async stashShow(params: { repoPath: string; stashRef?: string }) {
    const { repoPath, stashRef = 'stash@{0}' } = params;
    const diff = await this._runGit(repoPath, `stash show -p ${stashRef}`);
    const stats = await this._runGit(repoPath, `stash show --stat ${stashRef}`);

    return {
      ref: stashRef,
      diff,
      stats,
      lines: diff ? diff.split('\n') : []
    };
  }

  /**
   * Clear all stashes (dangerous!)
   * @param repoPath Path to repository
   * @param confirm Must be true to proceed
   */
  async stashesClear(params: { repoPath: string; confirm: boolean }) {
    const { repoPath, confirm } = params;

    if (!confirm) {
      return {
        cleared: false,
        warning: `This will delete ${stashList.length} stash(es). Set confirm=true to proceed.`,
        count: stashList.length
      };
    }

    await this._runGit(repoPath, 'stash clear');
    this.emit({ emit: 'toast', message: 'All stashes cleared', type: 'warning' });
    return { cleared: true };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY REWRITING - Advanced Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Squash multiple commits into one
   * @param repoPath Path to repository
   * @param baseCommit The commit BEFORE the range to squash (commits after this get squashed)
   * @param message New commit message for the squashed commit
   */
  async commitsSquash(params: { repoPath: string; baseCommit: string; message: string }) {
    const { repoPath, baseCommit, message } = params;

    // Safety: check for uncommitted changes
    const st = await this.status({ repoPath });
    if (st.staged.length > 0 || st.unstaged.length > 0) {
      return { squashed: false, error: 'You have uncommitted changes. Commit or stash them first.' };
    }

    // Get current HEAD for recovery
    const originalHead = await this._runGit(repoPath, 'rev-parse HEAD');

    try {
      // Soft reset to base commit (keeps all changes staged)
      await this._runGit(repoPath, `reset --soft ${this._shellEscape(baseCommit)}`);

      // Create new squashed commit
      await this._runGit(repoPath, `commit -m ${this._shellEscape(message)}`);

      const newHead = await this._runGit(repoPath, 'rev-parse --short HEAD');
      this.emit({ emit: 'toast', message: `Squashed into ${newHead}`, type: 'success' });

      return { squashed: true, newCommit: newHead, originalHead };
    } catch (error: any) {
      // Try to recover
      await this._runGit(repoPath, `reset --hard ${originalHead}`).catch(() => {});
      return { squashed: false, error: error.message, recovered: true };
    }
  }

  /**
   * Amend an older commit's message using automated rebase
   * @param repoPath Path to repository
   * @param commitHash The commit whose message to change
   * @param newMessage The new commit message
   */
  async commitMessageAmend(params: { repoPath: string; commitHash: string; newMessage: string }) {
    const { repoPath, commitHash, newMessage } = params;

    // Validate commit hash
    if (!this._isValidRefName(commitHash)) {
      throw new Error(`Invalid commit hash: ${commitHash}`);
    }

    // Safety check
    const st = await this.status({ repoPath });
    if (st.staged.length > 0 || st.unstaged.length > 0) {
      return { amended: false, error: 'You have uncommitted changes. Commit or stash them first.' };
    }

    const originalHead = await this._runGit(repoPath, 'rev-parse HEAD');

    try {
      // Create a cross-platform script to modify the rebase todo
      const shortHash = commitHash.slice(0, 7);
      const tmpDir = path.join(os.tmpdir(), `git-box-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });

      // Script to change 'pick' to 'reword' for our commit
      const seqEditorScript = path.join(tmpDir, 'seq-editor.sh');
      const seqContent = `#!/bin/sh
sed 's/^pick ${shortHash}/reword ${shortHash}/' "$1" > "$1.tmp" && mv "$1.tmp" "$1"
`;
      fs.writeFileSync(seqEditorScript, seqContent, { mode: 0o755 });

      // Script to write the new message
      const msgEditorScript = path.join(tmpDir, 'msg-editor.sh');
      const msgFile = path.join(tmpDir, 'message.txt');
      fs.writeFileSync(msgFile, newMessage);
      const msgContent = `#!/bin/sh
cat ${this._shellEscape(msgFile)} > "$1"
`;
      fs.writeFileSync(msgEditorScript, msgContent, { mode: 0o755 });

      try {
        await execAsync(
          `GIT_SEQUENCE_EDITOR=${this._shellEscape(seqEditorScript)} ` +
          `GIT_EDITOR=${this._shellEscape(msgEditorScript)} ` +
          `git -C ${this._shellEscape(repoPath)} rebase -i ${this._shellEscape(commitHash)}^`
        );

        this.emit({ emit: 'toast', message: 'Commit message amended', type: 'success' });
        return { amended: true, commit: commitHash };
      } finally {
        // Cleanup temp files
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch (error: any) {
      // Abort rebase if in progress
      await this._runGit(repoPath, 'rebase --abort').catch(() => {});
      return { amended: false, error: error.message, originalHead };
    }
  }

  /**
   * Remove a file from the entire git history (dangerous!)
   * @param repoPath Path to repository
   * @param filePath File to remove from history
   * @param confirm Must be true to proceed
   */
  async fileRemoveFromHistory(params: { repoPath: string; filePath: string; confirm: boolean }) {
    const { repoPath, filePath, confirm } = params;

    if (!confirm) {
      // Show what would be affected
      const commits = await this._runGit(repoPath, `log --all --oneline -- ${this._shellEscape(filePath)}`);
      const commitCount = commits ? commits.split('\n').filter(Boolean).length : 0;

      return {
        removed: false,
        warning: `This will rewrite ${commitCount} commit(s) that touch "${filePath}". This is destructive and affects shared history. Set confirm=true to proceed.`,
        affectedCommits: commitCount
      };
    }

    const originalHead = await this._runGit(repoPath, 'rev-parse HEAD');

    try {
      // Use git filter-branch to remove the file
      await this._runGit(repoPath,
        `filter-branch --force --index-filter "git rm --cached --ignore-unmatch '${filePath}'" --prune-empty --tag-name-filter cat -- --all`
      );

      // Clean up refs
      await this._runGit(repoPath, 'for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin').catch(() => {});
      await this._runGit(repoPath, 'reflog expire --expire=now --all').catch(() => {});
      await this._runGit(repoPath, 'gc --prune=now').catch(() => {});

      this.emit({ emit: 'toast', message: `Removed "${filePath}" from history`, type: 'warning' });
      return { removed: true, file: filePath, originalHead };
    } catch (error: any) {
      return { removed: false, error: error.message };
    }
  }

  /**
   * Cherry-pick one or more commits from another branch
   * @param repoPath Path to repository
   * @param commits Array of commit hashes to cherry-pick (in order)
   * @param noCommit If true, stage changes without committing
   */
  async cherryPick(params: { repoPath: string; commits: string[]; noCommit?: boolean }) {
    const { repoPath, commits, noCommit = false } = params;

    const results: { hash: string; success: boolean; error?: string }[] = [];
    const noCommitArg = noCommit ? '-n ' : '';

    for (const commit of commits) {
      try {
        await this._runGit(repoPath, `cherry-pick ${noCommitArg}${commit}`);
        results.push({ hash: commit, success: true });
      } catch (error: any) {
        // Check for conflicts
        const status = await this._runGit(repoPath, 'status --porcelain');
        const hasConflicts = status.includes('UU') || status.includes('AA');

        if (hasConflicts) {
          results.push({ hash: commit, success: false, error: 'Merge conflict' });
          // Don't continue with more commits if we hit a conflict
          break;
        }
        results.push({ hash: commit, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (failed > 0) {
      return { completed: false, results, message: `${successful} succeeded, ${failed} failed` };
    }

    this.emit({ emit: 'toast', message: `Cherry-picked ${successful} commit(s)`, type: 'success' });
    return { completed: true, results };
  }

  /**
   * Abort an in-progress cherry-pick
   * @param repoPath Path to repository
   */
  async cherryPickAbort(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'cherry-pick --abort');
    this.emit({ emit: 'toast', message: 'Cherry-pick aborted', type: 'info' });
    return { aborted: true };
  }

  /**
   * Continue cherry-pick after resolving conflicts
   * @param repoPath Path to repository
   */
  async cherryPickContinue(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'cherry-pick --continue');
    this.emit({ emit: 'toast', message: 'Cherry-pick continued', type: 'success' });
    return { continued: true };
  }

  /**
   * Revert a specific commit (creates a new commit that undoes it)
   * @param repoPath Path to repository
   * @param commitHash Commit to revert
   * @param noCommit If true, stage the revert without committing
   */
  async commitRevert(params: { repoPath: string; commitHash: string; noCommit?: boolean }) {
    const { repoPath, commitHash, noCommit = false } = params;

    try {
      const noCommitArg = noCommit ? '-n ' : '';
      await this._runGit(repoPath, `revert ${noCommitArg}${commitHash}`);

      this.emit({ emit: 'toast', message: `Reverted ${commitHash.slice(0, 7)}`, type: 'success' });
      return { reverted: true, commit: commitHash };
    } catch (error: any) {
      const status = await this._runGit(repoPath, 'status --porcelain');
      const hasConflicts = status.includes('UU');

      if (hasConflicts) {
        return { reverted: false, conflicts: true, message: 'Conflicts while reverting' };
      }
      return { reverted: false, error: error.message };
    }
  }

  /**
   * Abort an in-progress revert
   * @param repoPath Path to repository
   */
  async revertAbort(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'revert --abort');
    this.emit({ emit: 'toast', message: 'Revert aborted', type: 'info' });
    return { aborted: true };
  }

  /**
   * Fixup - amend staged changes into an older commit
   * @param repoPath Path to repository
   * @param targetCommit The commit to amend the staged changes into
   */
  async commitFixup(params: { repoPath: string; targetCommit: string }) {
    const { repoPath, targetCommit } = params;

    // Check for staged changes
    const st = await this.status({ repoPath });
    if (st.staged.length === 0) {
      return { fixed: false, error: 'No staged changes to fixup. Stage your changes first.' };
    }

    const originalHead = await this._runGit(repoPath, 'rev-parse HEAD');

    try {
      // Create a fixup commit
      await this._runGit(repoPath, `commit --fixup=${targetCommit}`);

      // Automatically squash it using rebase
      const env = 'GIT_SEQUENCE_EDITOR=true'; // Accept the auto-generated sequence
      await execAsync(`${env} git -C "${repoPath}" rebase -i --autosquash ${targetCommit}^`);

      this.emit({ emit: 'toast', message: `Fixed up ${targetCommit.slice(0, 7)}`, type: 'success' });
      return { fixed: true, targetCommit };
    } catch (error: any) {
      // Try to abort rebase
      await this._runGit(repoPath, 'rebase --abort').catch(() => {});
      return { fixed: false, error: error.message, originalHead };
    }
  }

  /**
   * Interactive rebase preview - shows what commits would be affected
   * @param repoPath Path to repository
   * @param baseCommit The commit to rebase onto (commits after this are affected)
   */
  async rebasePreview(params: { repoPath: string; baseCommit: string }) {
    const { repoPath, baseCommit } = params;

    const format = '%H|%h|%s';
    const output = await this._runGit(repoPath, `log ${baseCommit}..HEAD --format="${format}" --reverse`);

    if (!output) {
      return { commits: [], message: 'No commits to rebase' };
    }

    const commits = output.split('\n').filter(Boolean).map((line, index) => {
      const [hash, shortHash, subject] = line.split('|');
      return { index: index + 1, hash, shortHash, subject };
    });

    return { commits, baseCommit };
  }

  /**
   * Perform a scripted rebase with custom actions for each commit
   * @param repoPath Path to repository
   * @param baseCommit The commit to rebase onto
   * @param actions Array of actions: { hash, action: 'pick'|'reword'|'squash'|'fixup'|'drop', message? }
   */
  async rebaseScripted(params: {
    repoPath: string;
    baseCommit: string;
    actions: Array<{ hash: string; action: 'pick' | 'reword' | 'squash' | 'fixup' | 'drop'; message?: string }>;
  }) {
    const { repoPath, baseCommit, actions } = params;

    // Safety check
    const st = await this.status({ repoPath });
    if (st.staged.length > 0 || st.unstaged.length > 0) {
      return { rebased: false, error: 'You have uncommitted changes. Commit or stash them first.' };
    }

    const originalHead = await this._runGit(repoPath, 'rev-parse HEAD');

    // Validate inputs
    if (!this._isValidRefName(baseCommit)) {
      throw new Error(`Invalid base commit: ${baseCommit}`);
    }

    try {
      // Build the rebase script
      const script = actions.map(a => `${a.action} ${a.hash.slice(0, 7)}`).join('\n');

      // Create a temporary script that writes our sequence
      const tmpDir = path.join(os.tmpdir(), `git-box-rebase-${Date.now()}`);
      fs.mkdirSync(tmpDir, { recursive: true });
      const scriptPath = path.join(tmpDir, 'rebase-script.sh');
      const scriptContent = `#!/bin/sh\ncat > "$1" << 'SEQUENCE'\n${script}\nSEQUENCE`;
      fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

      try {
        await execAsync(
          `GIT_SEQUENCE_EDITOR=${this._shellEscape(scriptPath)} ` +
          `git -C ${this._shellEscape(repoPath)} rebase -i ${this._shellEscape(baseCommit)}`
        );
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }

      this.emit({ emit: 'toast', message: 'Rebase completed', type: 'success' });
      return { rebased: true, actions: actions.length };
    } catch (error: any) {
      // Check if rebase is in progress
      const rebaseDir = path.join(repoPath, '.git', 'rebase-merge');
      const isRebasing = fs.existsSync(rebaseDir);

      if (isRebasing) {
        return { rebased: false, inProgress: true, error: 'Rebase paused - conflicts or edit needed', originalHead };
      }

      await this._runGit(repoPath, 'rebase --abort').catch(() => {});
      return { rebased: false, error: error.message, originalHead };
    }
  }

  /**
   * Continue an in-progress rebase
   * @param repoPath Path to repository
   */
  async rebaseContinue(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'rebase --continue');
    this.emit({ emit: 'toast', message: 'Rebase continued', type: 'success' });
    return { continued: true };
  }

  /**
   * Abort an in-progress rebase
   * @param repoPath Path to repository
   */
  async rebaseAbort(params: { repoPath: string }) {
    await this._runGit(params.repoPath, 'rebase --abort');
    this.emit({ emit: 'toast', message: 'Rebase aborted', type: 'info' });
    return { aborted: true };
  }

  /**
   * Get conflicts in current merge/rebase/cherry-pick
   * @param repoPath Path to repository
   */
  async conflicts(params: { repoPath: string }) {
    const { repoPath } = params;

    const status = await this._runGit(repoPath, 'status --porcelain');
    const conflicts: { path: string; type: string }[] = [];

    for (const line of status.split('\n')) {
      if (!line) continue;
      const code = line.slice(0, 2);
      const filePath = line.slice(3);

      // UU = both modified, AA = both added, DD = both deleted
      if (code === 'UU' || code === 'AA' || code === 'DD' ||
          code === 'AU' || code === 'UA' || code === 'DU' || code === 'UD') {
        const typeMap: Record<string, string> = {
          'UU': 'both modified',
          'AA': 'both added',
          'DD': 'both deleted',
          'AU': 'added by us',
          'UA': 'added by them',
          'DU': 'deleted by us',
          'UD': 'deleted by them',
        };
        conflicts.push({ path: filePath, type: typeMap[code] || code });
      }
    }

    // Check what operation is in progress
    const gitDir = path.join(repoPath, '.git');
    let operation = 'none';
    if (fs.existsSync(path.join(gitDir, 'MERGE_HEAD'))) operation = 'merge';
    else if (fs.existsSync(path.join(gitDir, 'rebase-merge'))) operation = 'rebase';
    else if (fs.existsSync(path.join(gitDir, 'CHERRY_PICK_HEAD'))) operation = 'cherry-pick';
    else if (fs.existsSync(path.join(gitDir, 'REVERT_HEAD'))) operation = 'revert';

    return { conflicts, operation, hasConflicts: conflicts.length > 0 };
  }

  /**
   * Mark a conflicted file as resolved
   * @param repoPath Path to repository
   * @param filePath File to mark as resolved
   */
  async conflictMarkResolved(params: { repoPath: string; filePath: string }) {
    const { repoPath, filePath } = params;
    await this._runGit(repoPath, `add -- ${this._shellEscape(filePath)}`);
    this.emit({ emit: 'toast', message: `Marked resolved: ${filePath}`, type: 'success' });
    return { resolved: filePath };
  }

  /**
   * Use ours or theirs version for a conflicted file
   * @param repoPath Path to repository
   * @param filePath Conflicted file
   * @param version Which version to use: 'ours' or 'theirs'
   */
  async conflictResolve(params: { repoPath: string; filePath: string; version: 'ours' | 'theirs' }) {
    const { repoPath, filePath, version } = params;
    await this._runGit(repoPath, `checkout --${version} -- ${this._shellEscape(filePath)}`);
    await this._runGit(repoPath, `add -- ${this._shellEscape(filePath)}`);
    this.emit({ emit: 'toast', message: `Resolved with ${version}: ${filePath}`, type: 'success' });
    return { resolved: filePath, version };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLAME & SEARCH
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get blame information for a file
   * @param repoPath Path to repository
   * @param filePath File to blame
   * @param startLine Optional start line
   * @param endLine Optional end line
   */
  async blame(params: { repoPath: string; filePath: string; startLine?: number; endLine?: number }) {
    const { repoPath, filePath, startLine, endLine } = params;

    let lineArg = '';
    if (startLine && endLine) {
      lineArg = `-L ${startLine},${endLine}`;
    }

    const output = await this._runGit(repoPath, `blame ${lineArg} --porcelain -- ${this._shellEscape(filePath)}`);

    // Parse porcelain blame output
    const lines: any[] = [];
    const commits: Record<string, any> = {};
    let currentCommit: any = null;

    for (const line of output.split('\n')) {
      if (!line) continue;

      // Commit line: hash originalLine finalLine [numLines]
      const commitMatch = line.match(/^([a-f0-9]{40}) (\d+) (\d+)(?: (\d+))?$/);
      if (commitMatch) {
        currentCommit = {
          hash: commitMatch[1],
          originalLine: parseInt(commitMatch[2]),
          finalLine: parseInt(commitMatch[3]),
        };
        continue;
      }

      // Author info
      if (line.startsWith('author ')) {
        commits[currentCommit.hash] = commits[currentCommit.hash] || {};
        commits[currentCommit.hash].author = line.slice(7);
      } else if (line.startsWith('author-time ')) {
        commits[currentCommit.hash].date = new Date(parseInt(line.slice(12)) * 1000).toISOString();
      } else if (line.startsWith('summary ')) {
        commits[currentCommit.hash].summary = line.slice(8);
      } else if (line.startsWith('\t')) {
        // Content line
        lines.push({
          lineNumber: currentCommit.finalLine,
          hash: currentCommit.hash,
          shortHash: currentCommit.hash.slice(0, 7),
          content: line.slice(1),
          ...commits[currentCommit.hash]
        });
      }
    }

    return { filePath, lines };
  }

  /**
   * Search for commits by message, author, or content
   * @param repoPath Path to repository
   * @param query Search query
   * @param type Type of search: 'message', 'author', 'content', 'all'
   * @param limit Max results
   */
  async commitsSearch(params: { repoPath: string; query: string; type?: 'message' | 'author' | 'content' | 'all'; limit?: number }) {
    const { repoPath, query, type = 'all', limit = 50 } = params;

    const format = '%H|%h|%an|%at|%s';
    let searchArg = '';

    switch (type) {
      case 'message':
        searchArg = `--grep="${query}"`;
        break;
      case 'author':
        searchArg = `--author="${query}"`;
        break;
      case 'content':
        searchArg = `-S"${query}"`;
        break;
      case 'all':
        searchArg = `--grep="${query}" --author="${query}" --all-match`;
        break;
    }

    const output = await this._runGit(repoPath, `log ${searchArg} -n ${limit} --format="${format}"`);

    if (!output) return [];

    return output.split('\n').filter(Boolean).map(line => {
      const [hash, shortHash, author, timestamp, subject] = line.split('|');
      return {
        hash,
        shortHash,
        author,
        date: new Date(parseInt(timestamp) * 1000).toISOString(),
        subject,
      };
    });
  }

  /**
   * Find which commit introduced a specific line or change (pickaxe)
   * @param repoPath Path to repository
   * @param searchText Text to search for
   * @param filePath Optional file to limit search to
   */
  async changeFind(params: { repoPath: string; searchText: string; filePath?: string }) {
    const { repoPath, searchText, filePath } = params;

    const fileArg = filePath ? `-- ${this._shellEscape(filePath)}` : '';
    const format = '%H|%h|%an|%at|%s';

    const output = await this._runGit(repoPath, `log -S"${searchText}" --format="${format}" ${fileArg}`);

    if (!output) return [];

    return output.split('\n').filter(Boolean).map(line => {
      const [hash, shortHash, author, timestamp, subject] = line.split('|');
      return {
        hash,
        shortHash,
        author,
        date: new Date(parseInt(timestamp) * 1000).toISOString(),
        subject,
      };
    });
  }
}
