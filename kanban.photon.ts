/**
 * Kanban Board Photon
 *
 * Task management for humans and AI. Use named instances (`_use('project-name')`)
 * for per-project boards. Perfect for project planning, AI working memory across
 * sessions, and human-AI collaboration on shared tasks.
 *
 * @version 4.0.2
 * @author Portel
 * @license MIT
 * @tags kanban, tasks, collaboration, project-management, memory
 * @icon 📋
 * @stateful
 */

import { io } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface Comment {
  id: string;
  author: 'human' | 'ai';
  content: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  column: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  labels?: string[];
  context?: string; // For AI memory - store reasoning, notes, links
  links?: string[]; // Related files, URLs, or references
  comments?: Comment[]; // Instructions, updates, and conversation
  blockedBy?: string[]; // Task IDs that must complete before this can move to Review/Done
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // Card-specific automation (only used when in Backlog)
  autoPullThreshold?: number;    // Pull when In Progress < N (undefined = never auto-pull)
  autoReleaseMinutes?: number;   // Try to advance every N minutes (undefined = never auto-release)
  lastReleaseAttempt?: string;   // ISO timestamp for auto-release tracking
}

interface Board {
  name: string;
  projectRoot?: string; // Linked project folder path
  columns: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_COLUMNS = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];

function createEmptyBoard(name: string): Board {
  return {
    name,
    columns: [...DEFAULT_COLUMNS],
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// KANBAN PHOTON
// ════════════════════════════════════════════════════════════════════════════════

// Default to ~/.photon for user photons (can be overridden via PHOTON_DIR or PHOTONS_DIR)
const PHOTONS_DIR = process.env.PHOTON_DIR || process.env.PHOTONS_DIR || path.join(os.homedir(), '.photon');

// Config stored persistently so all instances (MCP, Beam, etc.) use same settings
interface KanbanConfig {
  projectsRoot: string;
  // WIP & Auto-pull settings
  wipLimit?: number;           // Max cards in "In Progress" (default: 3)
  autoPullEnabled?: boolean;   // Auto-pull when under WIP limit
  autoPullSource?: string;     // Column to pull from (default: "Todo")
  morningPullCount?: number;   // Cards to pull each morning (default: 3)
  staleTaskDays?: number;      // Days before task is stale (default: 7)
}

const DEFAULT_WIP_LIMIT = 10;
const DEFAULT_AUTO_PULL_SOURCE = 'Todo';
const DEFAULT_MORNING_PULL_COUNT = 3;
const DEFAULT_STALE_TASK_DAYS = 7;

const CONFIG_PATH = path.join(PHOTONS_DIR, 'kanban', 'config.json');
const DEFAULT_PROJECTS_ROOT = path.join(os.homedir(), 'Projects');

function loadConfig(): KanbanConfig {
  try {
    if (existsSync(CONFIG_PATH)) {
      return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch {}
  return { projectsRoot: DEFAULT_PROJECTS_ROOT };
}

function saveConfig(config: KanbanConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// State directory for cross-instance access (scheduled jobs, webhooks)
const STATE_DIR = path.join(PHOTONS_DIR, 'state', 'kanban');
// Archive/data directory (append-only logs, not instance state)
const DATA_DIR = path.join(PHOTONS_DIR, 'kanban');

export default class KanbanPhoton {
  boardData: Board;

  // Runtime-injected capabilities (auto-detected from usage patterns)
  declare emit: (data: any) => void;
  declare withLock: (lockName: string, fn: () => Promise<any>) => Promise<any>;
  declare instanceName: string;

  // projectsRoot is loaded from config file, not constructor
  private get projectsRoot(): string {
    return loadConfig().projectsRoot;
  }

  constructor(boardData: Board = createEmptyBoard('default')) {
    this.boardData = boardData;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CROSS-INSTANCE HELPERS (for scheduled jobs & webhooks)
  // ══════════════════════════════════════════════════════════════════════════════

  private async allBoardNames(): Promise<string[]> {
    try {
      const files = await fs.readdir(STATE_DIR);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch { return []; }
  }

  private async loadInstanceBoard(name: string): Promise<Board> {
    const statePath = path.join(STATE_DIR, `${name}.json`);
    try {
      const snapshot = JSON.parse(await fs.readFile(statePath, 'utf-8'));
      return snapshot.boardData || createEmptyBoard(name);
    } catch { return createEmptyBoard(name); }
  }

  private async saveInstanceBoard(name: string, board: Board): Promise<void> {
    const statePath = path.join(STATE_DIR, `${name}.json`);
    await fs.mkdir(path.dirname(statePath), { recursive: true });
    await fs.writeFile(statePath, JSON.stringify({ boardData: board }, null, 2));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Configure the Kanban photon
   *
   * Call this before using any board methods. Three behaviors:
   * 1. **AI with known values**: Pass params directly to skip elicitation
   * 2. **Already configured**: Loads existing config from disk
   * 3. **First-time human**: Prompts user to enter values via elicitation
   *
   * @param projectsRoot Root folder containing project directories (e.g., ~/Projects)
   * @param wipLimit Maximum cards allowed in "In Progress" column
   *
   * @example
   * // AI knows the values - skip elicitation
   * await configure({ projectsRoot: '/home/user/Projects', wipLimit: 5 })
   *
   * @example
   * // Ensure config exists (will elicit if needed)
   * await configure()
   */
  async *configure(params?: {
    projectsRoot?: string;
    wipLimit?: number;
    autoPullEnabled?: boolean;
    morningPullCount?: number;
    staleTaskDays?: number;
  }): AsyncGenerator<any, { configured: boolean; config?: KanbanConfig }> {
    // AI/UI provided values directly - merge with existing and save
    if (params && Object.keys(params).length > 0) {
      const existing = loadConfig();
      const config: KanbanConfig = {
        projectsRoot: params.projectsRoot ?? existing.projectsRoot,
        wipLimit: params.wipLimit ?? existing.wipLimit ?? DEFAULT_WIP_LIMIT,
        autoPullEnabled: params.autoPullEnabled ?? existing.autoPullEnabled,
        morningPullCount: params.morningPullCount ?? existing.morningPullCount,
        staleTaskDays: params.staleTaskDays ?? existing.staleTaskDays,
      };
      saveConfig(config);
      return { configured: true, config };
    }

    // Already configured - just return existing config
    if (existsSync(CONFIG_PATH)) {
      return { configured: true, config: loadConfig() };
    }

    // No config and no params - return defaults without eliciting
    // (elicitation happens in main() for first-time interactive setup)
    return { configured: false, config: loadConfig() };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Helper: channel name for emits
  private get channel(): string {
    return `kanban:${this.instanceName || 'default'}`;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TASK AUTOMATION HELPERS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Check if a task is blocked by unresolved dependencies
   */
  private isTaskBlocked(task: Task, board: Board): boolean {
    if (!task.blockedBy || task.blockedBy.length === 0) return false;

    // Check if any blocking task is NOT in Done
    return task.blockedBy.some(blockerId => {
      const blocker = board.tasks.find(t => t.id === blockerId);
      return blocker && blocker.column !== 'Done';
    });
  }

  /**
   * Get the names of tasks blocking this task
   */
  private getBlockingTaskNames(task: Task, board: Board): string[] {
    if (!task.blockedBy) return [];

    return task.blockedBy
      .map(id => board.tasks.find(t => t.id === id))
      .filter(t => t && t.column !== 'Done')
      .map(t => t!.title);
  }

  /**
   * Detect circular dependencies
   */
  private hasCircularDependency(taskId: string, blockedBy: string[], board: Board, visited = new Set<string>()): boolean {
    if (visited.has(taskId)) return true;
    visited.add(taskId);

    for (const blockerId of blockedBy) {
      const blocker = board.tasks.find(t => t.id === blockerId);
      if (blocker?.blockedBy) {
        if (this.hasCircularDependency(taskId, blocker.blockedBy, board, visited)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Called after a task is moved - handles unblocking and auto-pull
   */
  private async afterTaskMoved(task: Task, fromColumn: string, toColumn: string): Promise<void> {
    // 1. If moved to Done, check if this unblocks other tasks
    if (toColumn === 'Done') {
      this.checkUnblockedTasks(task.id);
    }

    // 2. If In Progress changed, check WIP and auto-pull
    if (fromColumn === 'In Progress' || toColumn === 'In Progress') {
      this.checkWipAndAutoPull();
    }
  }

  /**
   * Check if completing a task unblocks others
   */
  private checkUnblockedTasks(completedTaskId: string): void {
    for (const task of this.boardData.tasks) {
      if (!task.blockedBy?.includes(completedTaskId)) continue;

      // Remove the completed task from blockedBy
      task.blockedBy = task.blockedBy.filter(id => id !== completedTaskId);
      task.updatedAt = new Date().toISOString();

      // Check if task is now fully unblocked
      if (!this.isTaskBlocked(task, this.boardData)) {
        this.emit({
          emit: 'toast',
          message: `🔓 "${task.title}" is now unblocked!`,
        });
        this.emit({
          channel: this.channel,
          event: 'task-unblocked',
          data: { task, unblockedBy: completedTaskId },
        });
      }
    }
  }

  /**
   * Check WIP limit and auto-pull cards with autoPullThreshold set
   *
   * Card-specific auto-pull: Each Backlog card can set its own threshold.
   * When In Progress count < card's threshold, that card gets pulled.
   */
  private checkWipAndAutoPull(): void {
    const config = loadConfig();
    const wipLimit = config.wipLimit ?? DEFAULT_WIP_LIMIT;
    const inProgressCount = this.boardData.tasks.filter(t => t.column === 'In Progress').length;

    // Hard WIP limit - never exceed
    if (inProgressCount >= wipLimit) return;

    // Find eligible cards: in Backlog, has threshold, threshold > inProgressCount, not blocked
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const candidates = this.boardData.tasks
      .filter(t =>
        t.column === 'Backlog' &&
        t.autoPullThreshold !== undefined &&
        inProgressCount < t.autoPullThreshold &&
        !this.isTaskBlocked(t, this.boardData)
      )
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const nextTask = candidates[0];
    if (nextTask) {
      const oldColumn = nextTask.column;
      nextTask.column = 'In Progress';
      nextTask.updatedAt = new Date().toISOString();

      // Move to top of In Progress
      const taskIndex = this.boardData.tasks.findIndex(t => t.id === nextTask.id);
      this.boardData.tasks.splice(taskIndex, 1);
      const firstInProgress = this.boardData.tasks.findIndex(t => t.column === 'In Progress');
      if (firstInProgress === -1) {
        this.boardData.tasks.push(nextTask);
      } else {
        this.boardData.tasks.splice(firstInProgress, 0, nextTask);
      }

      this.emit({
        emit: 'toast',
        message: `⚡ Auto-pulled "${nextTask.title}" to In Progress (WIP: ${inProgressCount + 1}/${wipLimit})`,
      });
      this.emit({
        channel: this.channel,
        event: 'task-auto-pulled',
        data: { task: nextTask, from: oldColumn },
      });
    }
  }

  /**
   * Find the next task that can be pulled to In Progress
   */
  private findNextPullableTask(board: Board, sourceColumn: string): Task | undefined {
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    const candidates = board.tasks
      .filter(t => t.column === sourceColumn && !this.isTaskBlocked(t, board))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return candidates[0];
  }

  /**
   * Install Claude Code hooks in a project folder
   */
  /**
   * Check if a folder is a Claude Code project
   *
   * Looks for indicators like .claude folder, CLAUDE.md, or .claude/settings.json
   */
  private isClaudeCodeProject(projectRoot: string): boolean {
    const indicators = [
      path.join(projectRoot, '.claude'),
      path.join(projectRoot, 'CLAUDE.md'),
      path.join(projectRoot, '.claude', 'settings.json'),
      path.join(projectRoot, '.claude', 'settings.local.json'),
    ];
    return indicators.some(p => existsSync(p));
  }

  /**
   * Install Claude Code hooks in a project folder
   *
   * Installs stop hook (blocks stopping with incomplete tasks) and
   * user-prompt-submit hook (logs user messages for reference).
   *
   * Only installs if the folder appears to be a Claude Code project
   * (has .claude folder or CLAUDE.md).
   *
   * @returns Status of installation
   */
  async hooks(params?: { folder?: string }): Promise<{
    installed: boolean;
    projectRoot: string;
    isClaudeProject: boolean;
    message: string;
  }> {
    // Determine project root
    let projectRoot: string;
    if (params?.folder) {
      projectRoot = path.isAbsolute(params.folder)
        ? params.folder
        : path.join(this.projectsRoot, params.folder);
    } else {
      projectRoot = process.cwd();
    }

    if (!existsSync(projectRoot)) {
      return {
        installed: false,
        projectRoot,
        isClaudeProject: false,
        message: `Folder not found: ${projectRoot}`,
      };
    }

    const isClaudeProject = this.isClaudeCodeProject(projectRoot);

    if (!isClaudeProject) {
      return {
        installed: false,
        projectRoot,
        isClaudeProject: false,
        message: `Not a Claude Code project (no .claude folder or CLAUDE.md). Create .claude folder first or run from a Claude Code session.`,
      };
    }

    await this.writeHooksToProject(projectRoot);

    return {
      installed: true,
      projectRoot,
      isClaudeProject: true,
      message: `Hooks installed to ${projectRoot}/.claude/hooks/`,
    };
  }

  private async writeHooksToProject(projectRoot: string): Promise<void> {
    const claudeDir = path.join(projectRoot, '.claude');
    const hooksDir = path.join(claudeDir, 'hooks');

    // Create directories
    await fs.mkdir(hooksDir, { recursive: true });

    // User prompt submit hook - logs user messages
    const userPromptHook = `#!/usr/bin/env -S node --experimental-strip-types
/**
 * Claude Code UserPromptSubmit Hook - Message Logger
 * Logs user messages for reference and compaction-proof history.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const LOG_FILE = path.join(process.cwd(), '.claude', 'user-prompts.log');

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) {
  input += chunk;
}

try {
  const data = JSON.parse(input);
  const prompt = data.prompt?.trim();

  if (prompt && prompt.length >= 10 && !prompt.startsWith('/')) {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      prompt: prompt
    }) + '\\n';

    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.appendFile(LOG_FILE, entry);
  }
} catch {}

process.exit(0);
`;

    // Stop hook - checks for pending tasks
    const stopHook = `#!/usr/bin/env -S node --experimental-strip-types
/**
 * Claude Code Stop Hook - Kanban Task Enforcement
 * Blocks stopping if there are incomplete tasks or unchecked items.
 */

import { execSync } from 'child_process';

function countCheckboxes(text) {
  if (!text) return { checked: 0, unchecked: 0 };
  const unchecked = (text.match(/^[\\s]*[-*]\\s*\\[\\s*\\]/gm) || []).length;
  const checked = (text.match(/^[\\s]*[-*]\\s*\\[[xX]\\]/gm) || []).length;
  return { checked, unchecked };
}

try {
  const result = execSync('photon cli kanban mine --json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const tasks = JSON.parse(result.trim());

  if (Array.isArray(tasks) && tasks.length > 0) {
    const pendingDetails = [];

    for (const task of tasks) {
      const counts = countCheckboxes(task.description);
      if (counts.unchecked > 0) {
        pendingDetails.push(\`"\${task.title}": \${counts.unchecked} unchecked items\`);
      } else if (counts.checked === 0 && counts.unchecked === 0) {
        pendingDetails.push(\`"\${task.title}": needs completion\`);
      }
    }

    if (pendingDetails.length > 0) {
      console.log(JSON.stringify({
        decision: 'block',
        reason: \`Incomplete kanban tasks:\\n\${pendingDetails.join('\\n')}\\n\\nComplete all checkbox items or move tasks to Done.\`
      }));
    }
  }
} catch {}

process.exit(0);
`;

    // Write hooks
    await fs.writeFile(path.join(hooksDir, 'user-prompt-submit'), userPromptHook);
    await fs.writeFile(path.join(hooksDir, 'stop'), stopHook);

    // Make executable
    await fs.chmod(path.join(hooksDir, 'user-prompt-submit'), 0o755);
    await fs.chmod(path.join(hooksDir, 'stop'), 0o755);

    // Create/update settings.json
    const settingsPath = path.join(claudeDir, 'settings.json');
    let settings: any = { hooks: {} };

    try {
      const existing = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(existing);
      if (!settings.hooks) settings.hooks = {};
    } catch {}

    settings.hooks.UserPromptSubmit = [{
      matcher: '',
      hooks: [{ type: 'command', command: '.claude/hooks/user-prompt-submit' }]
    }];
    settings.hooks.Stop = [{
      matcher: '',
      hooks: [{ type: 'command', command: '.claude/hooks/stop' }]
    }];

    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  }


  // ══════════════════════════════════════════════════════════════════════════════
  // AUTO-ARCHIVE HELPER
  // ══════════════════════════════════════════════════════════════════════════════

  private getArchivePath(boardName: string): string {
    const safeName = boardName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(DATA_DIR, 'boards', `${safeName}.archive.jsonl`);
  }

  private async _archiveTasks(boardName: string, tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return;

    const archivePath = this.getArchivePath(boardName);
    const timestamp = new Date().toISOString();

    // Append each task as a JSON line with archive metadata
    const lines = tasks.map(task =>
      JSON.stringify({ ...task, archivedAt: timestamp })
    ).join('\n') + '\n';

    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    await fs.appendFile(archivePath, lines);

    // Rotate: remove entries older than 30 days
    await this._rotateArchive(boardName);
  }

  private async _rotateArchive(boardName: string): Promise<void> {
    const archivePath = this.getArchivePath(boardName);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    try {
      const content = await fs.readFile(archivePath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);

      // Keep only entries from last 30 days
      const kept = lines.filter(line => {
        try {
          const entry = JSON.parse(line);
          const archivedAt = new Date(entry.archivedAt).getTime();
          return archivedAt > thirtyDaysAgo;
        } catch {
          return false;
        }
      });

      if (kept.length < lines.length) {
        await fs.writeFile(archivePath, kept.join('\n') + (kept.length ? '\n' : ''));
      }
    } catch {
      // Archive doesn't exist yet, nothing to rotate
    }
  }

  /**
   * Auto-archive excess Done tasks from a board
   */
  private async autoArchiveBoard(board: Board): Promise<void> {
    const doneTasks = board.tasks.filter(t => t.column === 'Done');
    if (doneTasks.length > 50) {
      doneTasks.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
      const toArchive = doneTasks.slice(50);
      await this._archiveTasks(board.name, toArchive);

      const archiveIds = new Set(toArchive.map(t => t.id));
      board.tasks = board.tasks.filter(t => !archiveIds.has(t.id));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DATA MIGRATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * One-time migration from old boards/*.json to state dir
   */
  private async migrateOldBoards(): Promise<boolean> {
    const oldBoardsDir = path.join(PHOTONS_DIR, 'kanban', 'boards');
    let didMigrate = false;

    try {
      const files = await fs.readdir(oldBoardsDir);
      const boardFiles = files.filter(f => f.endsWith('.json') && !f.includes('.archive'));

      for (const file of boardFiles) {
        const name = file.replace('.json', '');
        const statePath = path.join(STATE_DIR, `${name}.json`);

        // Only migrate if state file is empty or missing
        let needsMigration = false;
        try {
          const existing = await fs.readFile(statePath, 'utf-8');
          const parsed = JSON.parse(existing);
          // Empty marker file (from _use fix) — needs migration
          needsMigration = !parsed.boardData;
        } catch {
          needsMigration = true;
        }

        if (needsMigration) {
          const oldData = await fs.readFile(path.join(oldBoardsDir, file), 'utf-8');
          const boardObj = JSON.parse(oldData) as Board;
          boardObj.name = name;

          await fs.mkdir(STATE_DIR, { recursive: true });
          await fs.writeFile(statePath, JSON.stringify({ boardData: boardObj }, null, 2));
          didMigrate = true;
        }
      }
    } catch {
      // No old boards dir — nothing to migrate
    }

    return didMigrate;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Open the Kanban board
   *
   * Visual drag-and-drop board for managing tasks. Both humans and AI can
   * interact with this board - humans through the UI, AI through MCP methods.
   *
   * ## AI Workflow (IMPORTANT)
   *
   * When working on tasks as an AI assistant:
   *
   * 1. **Check assigned tasks**: Use `mine` to find tasks assigned to you
   * 2. **Work in "In Progress"**: Tasks you're actively working on should be here
   * 3. **Move to "Review" when done**: Do NOT move directly to "Done"!
   *    - "Review" means: AI finished, waiting for human verification
   *    - Only humans should move tasks from "Review" to "Done"
   * 4. **Add comments**: Document what you did for the reviewer
   *
   * This keeps humans in the loop and ensures quality control.
   *
   * @ui board
   */
  async *main() {
    // First-time setup: create config with defaults (user can run `configure` to customize)
    if (!existsSync(CONFIG_PATH)) {
      saveConfig({
        projectsRoot: DEFAULT_PROJECTS_ROOT,
        wipLimit: DEFAULT_WIP_LIMIT,
      });
    }

    // Migrate old board files on first access
    const migrated = await this.migrateOldBoards();
    if (migrated) {
      // Reload in-memory state from freshly migrated data
      const instanceName = this.instanceName || 'default';
      const loaded = await this.loadInstanceBoard(instanceName);
      this.boardData = loaded;
    }

    // Sync board name with instance
    this.boardData.name = this.instanceName || 'default';

    return this.boardData;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TASK METHODS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get all tasks, optionally filtered
   *
   * Use this to understand the current state of the project, find tasks
   * assigned to you, or check what needs attention.
   *
   * @example list({ assignee: 'ai' })
   * @example list({ column: 'Todo' })
   */
  async list(params?: {
    column?: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
    label?: string;
  }): Promise<Task[]> {
    let tasks = [...this.boardData.tasks];

    if (params?.column) {
      tasks = tasks.filter((t) => t.column.toLowerCase() === params.column!.toLowerCase());
    }
    if (params?.assignee) {
      tasks = tasks.filter((t) => t.assignee?.toLowerCase() === params.assignee!.toLowerCase());
    }
    if (params?.priority) {
      tasks = tasks.filter((t) => t.priority === params.priority);
    }
    if (params?.label) {
      tasks = tasks.filter((t) => t.labels?.includes(params.label!));
    }

    return tasks;
  }

  /**
   * Get tasks assigned to AI
   *
   * Quickly see what tasks are waiting for AI to work on.
   * Call this at the start of a session to check your workload.
   *
   * **Workflow reminder**:
   * - Work on tasks in "In Progress"
   * - When finished, move to "Review" (not "Done")
   * - Add a comment explaining what you did
   * - Humans will review and move to "Done"
   */
  async mine(): Promise<Task[]> {
    return this.boardData.tasks.filter(
      (t) => t.assignee?.toLowerCase() === 'ai' && t.column !== 'Done'
    );
  }

  /**
   * Create a new task
   *
   * Add a task to the board. By default, tasks go to 'Backlog' column.
   * Use 'context' to store AI reasoning or notes for memory.
   * Use 'blockedBy' to specify dependencies (task IDs that must complete first).
   * Use 'autoPullThreshold' to auto-pull when In Progress < N.
   * Use 'autoReleaseMinutes' to auto-release after N minutes.
   *
   * @example add({ title: 'Fix bug', priority: 'high' })
   * @example add({ title: 'Research auth', context: 'User wants JWT with refresh tokens', links: ['/src/auth/'] })
   * @example add({ title: 'Deploy', blockedBy: ['abc123'] }) // Blocked until abc123 is done
   * @locked board:write
   */
  async add(params: {
    title: string;
    description?: string;
    column?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
    context?: string;
    links?: string[];
    blockedBy?: string[];
    /** Auto-pull threshold: pull when In Progress < N (only for Backlog cards) */
    autoPullThreshold?: number;
    /** Auto-release interval in minutes (only for Backlog cards) */
    autoReleaseMinutes?: number;
  }): Promise<Task> {
    // Validate blockedBy references exist
    if (params.blockedBy) {
      for (const blockerId of params.blockedBy) {
        if (!this.boardData.tasks.find(t => t.id === blockerId)) {
          throw new Error(`Invalid blockedBy reference: task "${blockerId}" not found`);
        }
      }
    }

    const task: Task = {
      id: this.generateId(),
      title: params.title,
      description: params.description,
      column: params.column || 'Backlog',
      priority: params.priority || 'medium',
      assignee: params.assignee,
      labels: params.labels,
      context: params.context,
      links: params.links,
      blockedBy: params.blockedBy,
      autoPullThreshold: params.autoPullThreshold,
      autoReleaseMinutes: params.autoReleaseMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'ai',
    };

    // Check for circular dependencies
    if (task.blockedBy && this.hasCircularDependency(task.id, task.blockedBy, this.boardData)) {
      throw new Error('Circular dependency detected');
    }

    // Validate column exists
    if (!this.boardData.columns.includes(task.column)) {
      task.column = 'Backlog';
    }

    // Insert at TOP of target column (newest first)
    const firstInColumn = this.boardData.tasks.findIndex(t => t.column === task.column);
    if (firstInColumn === -1) {
      this.boardData.tasks.push(task);
    } else {
      this.boardData.tasks.splice(firstInColumn, 0, task);
    }
    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'task-created', data: { task } });

    // Notify Claude Code if task is assigned to AI
    if (task.assignee === 'ai') {
      this.emit({ emit: 'status', type: 'info', message: `New task assigned: ${task.title} [${this.boardData.name}]` });
    }

    return task;
  }

  /**
   * Move a task to a different column
   *
   * Update the status of a task by moving it between columns.
   * Common flow: Backlog → Todo → In Progress → Review → Done
   *
   * **AI WORKFLOW**: When you complete a task, move it to "Review" - NOT "Done"!
   * The "Review" column is for human verification. Only humans move tasks to "Done".
   *
   * **Dependencies**: Tasks with unresolved `blockedBy` cannot move to Review or Done.
   *
   * @example move({ id: 'abc123', column: 'In Progress' })
   * @example move({ id: 'abc123', column: 'Review' }) // AI finished, awaiting human review
   * @locked board:write
   */
  async move(params: { id: string; column: string }): Promise<Task> {
    const task = this.boardData.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    // Validate column exists
    if (!this.boardData.columns.includes(params.column)) {
      throw new Error(`Invalid column: ${params.column}. Available: ${this.boardData.columns.join(', ')}`);
    }

    // Check dependencies before moving to Review or Done
    if (['Review', 'Done'].includes(params.column) && this.isTaskBlocked(task, this.boardData)) {
      const blockers = this.getBlockingTaskNames(task, this.boardData);
      throw new Error(`Cannot move to ${params.column}: blocked by "${blockers.join('", "')}". Complete blocking tasks first.`);
    }

    const fromColumn = task.column;

    // Remove task from current position
    const oldIndex = this.boardData.tasks.findIndex((t) => t.id === params.id);
    this.boardData.tasks.splice(oldIndex, 1);

    // Update column and timestamp
    task.column = params.column;
    task.updatedAt = new Date().toISOString();

    // Insert at TOP of target column (most visible position)
    const firstInColumn = this.boardData.tasks.findIndex((t) => t.column === params.column);
    if (firstInColumn === -1) {
      this.boardData.tasks.push(task);
    } else {
      this.boardData.tasks.splice(firstInColumn, 0, task);
    }

    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'task-moved', data: { task } });

    // After-move automation (unblock checks, WIP auto-pull)
    await this.afterTaskMoved(task, fromColumn, params.column);

    return task;
  }

  /**
   * Reorder a task within or across columns
   *
   * Move a task to a specific position. Use `beforeId` to place before another task,
   * or omit to place at the end of the column. Array order = display order.
   *
   * @example reorder({ id: 'abc', column: 'Todo', beforeId: 'xyz' })
   * @example reorder({ id: 'abc', column: 'Done' })
   * @locked board:write
   */
  async reorder(params: {
    id: string;
    column: string;
    beforeId?: string;
  }): Promise<Task> {
    const taskIndex = this.boardData.tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      throw new Error(`Task not found: ${params.id}`);
    }

    // Validate column exists
    if (!this.boardData.columns.includes(params.column)) {
      throw new Error(`Invalid column: ${params.column}. Available: ${this.boardData.columns.join(', ')}`);
    }

    // Remove task from current position
    const [task] = this.boardData.tasks.splice(taskIndex, 1);
    task.column = params.column;
    task.updatedAt = new Date().toISOString();

    // Find insert position
    if (params.beforeId) {
      const beforeIndex = this.boardData.tasks.findIndex((t) => t.id === params.beforeId);
      if (beforeIndex === -1) {
        // beforeId not found, insert at top of column
        const firstInColumn = this.boardData.tasks.findIndex((t) => t.column === params.column);
        if (firstInColumn === -1) {
          this.boardData.tasks.push(task);
        } else {
          this.boardData.tasks.splice(firstInColumn, 0, task);
        }
      } else {
        this.boardData.tasks.splice(beforeIndex, 0, task);
      }
    } else {
      // No beforeId - insert at TOP of the column (most visible position)
      const firstInColumn = this.boardData.tasks.findIndex((t) => t.column === params.column);
      if (firstInColumn === -1) {
        // No tasks in column yet, just append
        this.boardData.tasks.push(task);
      } else {
        this.boardData.tasks.splice(firstInColumn, 0, task);
      }
    }

    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'task-reordered', data: { task } });

    return task;
  }

  /**
   * Update a task's details
   *
   * Modify task title, description, priority, assignee, labels, context, dependencies, or automation settings.
   * @locked board:write
   */
  async edit(params: {
    id: string;
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
    context?: string;
    links?: string[];
    blockedBy?: string[];
    /** Auto-pull threshold: pull when In Progress < N (only for Backlog cards) */
    autoPullThreshold?: number;
    /** Auto-release interval in minutes (only for Backlog cards) */
    autoReleaseMinutes?: number;
  }): Promise<Task> {
    const task = this.boardData.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    // Validate blockedBy references if provided
    if (params.blockedBy) {
      for (const blockerId of params.blockedBy) {
        if (blockerId === params.id) {
          throw new Error('Task cannot block itself');
        }
        if (!this.boardData.tasks.find(t => t.id === blockerId)) {
          throw new Error(`Invalid blockedBy reference: task "${blockerId}" not found`);
        }
      }
      // Check for circular dependencies
      if (this.hasCircularDependency(params.id, params.blockedBy, this.boardData)) {
        throw new Error('Circular dependency detected');
      }
    }

    if (params.title !== undefined) task.title = params.title;
    if (params.description !== undefined) task.description = params.description;
    if (params.priority !== undefined) task.priority = params.priority;
    if (params.assignee !== undefined) task.assignee = params.assignee;
    if (params.labels !== undefined) task.labels = params.labels;
    if (params.context !== undefined) task.context = params.context;
    if (params.links !== undefined) task.links = params.links;
    if (params.blockedBy !== undefined) task.blockedBy = params.blockedBy;
    if (params.autoPullThreshold !== undefined) task.autoPullThreshold = params.autoPullThreshold || undefined;
    if (params.autoReleaseMinutes !== undefined) task.autoReleaseMinutes = params.autoReleaseMinutes || undefined;
    task.updatedAt = new Date().toISOString();
    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'task-updated', data: { task } });

    return task;
  }

  /**
   * Delete a task
   *
   * Also removes this task from any other task's blockedBy list.
   * @locked board:write
   */
  async drop(params: { id: string }): Promise<{ success: boolean; message: string }> {
    const index = this.boardData.tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      throw new Error(`Task not found: ${params.id}`);
    }

    const [removed] = this.boardData.tasks.splice(index, 1);

    // Remove this task from any blockedBy references
    for (const task of this.boardData.tasks) {
      if (task.blockedBy?.includes(removed.id)) {
        task.blockedBy = task.blockedBy.filter(id => id !== removed.id);
        task.updatedAt = new Date().toISOString();
      }
    }

    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'task-deleted', data: { taskId: removed.id } });

    return { success: true, message: `Deleted task: ${removed.title}` };
  }

  /**
   * Search tasks on the current board
   *
   * Find tasks by keyword in title, description, or context.
   */
  async search(params: {
    query: string;
  }): Promise<Task[]> {
    const query = params.query.toLowerCase();
    return this.boardData.tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.context?.toLowerCase().includes(query)
    );
  }

  /**
   * Add a comment to a task
   *
   * Use comments for instructions, updates, questions, and conversation.
   * Both humans and AI can add comments to track progress and communicate.
   *
   * @example comment({ id: 'abc123', content: 'Please use JWT for auth', author: 'human' })
   * @example comment({ id: 'abc123', content: 'Implemented JWT with refresh tokens', author: 'ai' })
   * @locked board:write
   */
  async comment(params: {
    id: string;
    content: string;
    author?: 'human' | 'ai';
  }): Promise<Comment> {
    const task = this.boardData.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    const comment: Comment = {
      id: this.generateId(),
      author: params.author || 'ai',
      content: params.content,
      createdAt: new Date().toISOString(),
    };

    if (!task.comments) {
      task.comments = [];
    }
    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    this.boardData.updatedAt = new Date().toISOString();

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'comment-added', data: { taskId: task.id, comment } });

    return comment;
  }

  /**
   * Get comments for a task
   *
   * Retrieve all comments/conversation for a specific task.
   */
  async comments(params: {
    id: string;
  }): Promise<Comment[]> {
    const task = this.boardData.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    return task.comments || [];
  }

  /**
   * Get a task with all its details including comments
   *
   * Returns the full task object with comments for context.
   */
  async show(params: {
    id: string;
  }): Promise<Task> {
    const task = this.boardData.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    return task;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // BOARD METHODS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get the current board state
   *
   * Returns all columns and tasks. Useful for AI to understand the full context.
   */
  async board(): Promise<Board> {
    return this.boardData;
  }

  /**
   * Add or remove a column
   *
   * By default adds a new column. Set `remove: true` to remove instead.
   * Removed columns move their tasks to Backlog. Cannot remove Backlog or Done.
   *
   * @example column({ name: 'QA' }) // Add before Done
   * @example column({ name: 'QA', position: 2 }) // Add at position
   * @example column({ name: 'QA', remove: true }) // Remove
   * @locked board:write
   */
  async column(params: { name: string; position?: number; remove?: boolean }): Promise<string[]> {
    if (params.remove) {
      if (['Backlog', 'Done'].includes(params.name)) {
        throw new Error(`Cannot remove ${params.name} column`);
      }
      const index = this.boardData.columns.indexOf(params.name);
      if (index === -1) {
        throw new Error(`Column not found: ${params.name}`);
      }
      this.boardData.tasks.forEach((task) => {
        if (task.column === params.name) {
          task.column = 'Backlog';
        }
      });
      this.boardData.columns.splice(index, 1);
    } else {
      if (this.boardData.columns.includes(params.name)) {
        throw new Error(`Column already exists: ${params.name}`);
      }
      if (params.position !== undefined) {
        this.boardData.columns.splice(params.position, 0, params.name);
      } else {
        const doneIndex = this.boardData.columns.indexOf('Done');
        if (doneIndex > -1) {
          this.boardData.columns.splice(doneIndex, 0, params.name);
        } else {
          this.boardData.columns.push(params.name);
        }
      }
    }

    this.boardData.updatedAt = new Date().toISOString();
    return this.boardData.columns;
  }

  /**
   * Clear completed tasks (archive them)
   * @locked board:write
   */
  async clear(): Promise<{ removed: number }> {
    const before = this.boardData.tasks.length;
    this.boardData.tasks = this.boardData.tasks.filter((t) => t.column !== 'Done');
    const removed = before - this.boardData.tasks.length;
    this.boardData.updatedAt = new Date().toISOString();
    return { removed };
  }

  /**
   * Get board statistics
   *
   * Includes WIP status showing current vs limit for In Progress column.
   */
  async stats(): Promise<{
    board: string;
    total: number;
    byColumn: Record<string, number>;
    byPriority: Record<string, number>;
    byAssignee: Record<string, number>;
    wip: { current: number; limit: number; autoPullEnabled: boolean };
    blockedCount: number;
  }> {
    const config = loadConfig();
    const byColumn: Record<string, number> = {};
    const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const byAssignee: Record<string, number> = {};
    let blockedCount = 0;

    this.boardData.columns.forEach((col) => (byColumn[col] = 0));

    this.boardData.tasks.forEach((task) => {
      byColumn[task.column] = (byColumn[task.column] || 0) + 1;
      byPriority[task.priority]++;
      if (task.assignee) {
        byAssignee[task.assignee] = (byAssignee[task.assignee] || 0) + 1;
      }
      if (this.isTaskBlocked(task, this.boardData)) {
        blockedCount++;
      }
    });

    return {
      board: this.boardData.name,
      total: this.boardData.tasks.length,
      byColumn,
      byPriority,
      byAssignee,
      wip: {
        current: byColumn['In Progress'] || 0,
        limit: config.wipLimit ?? DEFAULT_WIP_LIMIT,
        autoPullEnabled: config.autoPullEnabled ?? false,
      },
      blockedCount,
    };
  }

  /**
   * Set task dependencies
   *
   * Convenience method to add or remove dependencies between tasks.
   *
   * @example block({ id: 'task2', blockedBy: 'task1' }) // task2 waits for task1
   * @example block({ id: 'task2', blockedBy: 'task1', remove: true }) // remove dependency
   * @locked board:write
   */
  async block(params: {
    id: string;
    blockedBy: string;
    remove?: boolean;
  }): Promise<Task> {
    const task = this.boardData.tasks.find(t => t.id === params.id);
    const blocker = this.boardData.tasks.find(t => t.id === params.blockedBy);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }
    if (!blocker) {
      throw new Error(`Blocking task not found: ${params.blockedBy}`);
    }
    if (params.id === params.blockedBy) {
      throw new Error('Task cannot block itself');
    }

    if (!task.blockedBy) {
      task.blockedBy = [];
    }

    if (params.remove) {
      task.blockedBy = task.blockedBy.filter(id => id !== params.blockedBy);
    } else {
      if (!task.blockedBy.includes(params.blockedBy)) {
        // Check for circular dependency
        if (this.hasCircularDependency(params.id, [...task.blockedBy, params.blockedBy], this.boardData)) {
          throw new Error('Circular dependency detected');
        }
        task.blockedBy.push(params.blockedBy);
      }
    }

    task.updatedAt = new Date().toISOString();
    this.boardData.updatedAt = new Date().toISOString();

    this.emit({ emit: 'board-update', board: this.boardData.name });
    this.emit({ channel: this.channel, event: 'dependency-changed', data: { task, blocker, removed: params.remove } });

    return task;
  }

  /**
   * Report a JavaScript error from the UI
   *
   * Used by the kanban UI to report runtime errors back to developers/AI.
   * Errors are logged to a file for debugging and can trigger notifications.
   *
   * @internal
   */
  async reportError(params: {
    error: {
      message: string;
      source?: string;
      line?: number;
      col?: number;
      stack?: string;
      timestamp?: string;
    };
  }): Promise<{ logged: boolean }> {
    const errorLogPath = path.join(DATA_DIR, 'ui-errors.log');
    const logEntry = {
      board: this.instanceName || 'default',
      ...params.error,
      timestamp: params.error.timestamp || new Date().toISOString(),
    };

    // Append to error log
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(errorLogPath, logLine);

    // Also emit for real-time notification
    this.emit({
      channel: `kanban:errors`,
      event: 'ui-error',
      data: logEntry,
    });

    console.error('[Kanban UI Error]', logEntry.message, logEntry.source, logEntry.line);

    return { logged: true };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SCHEDULED JOBS (daemon features)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Archive old completed tasks
   *
   * Runs daily at midnight to move completed tasks older than 7 days
   * to an archive file, keeping the board clean.
   *
   * @scheduled 0 0 * * *
   * @internal
   * @timeout 30s
   * @queued 1
   */
  async scheduledArchiveOldTasks(): Promise<{ archived: number }> {
    const boardNames = await this.allBoardNames();
    let totalArchived = 0;

    for (const name of boardNames) {
      const board = await this.loadInstanceBoard(name);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const toArchive = board.tasks.filter(
        (task) =>
          task.column === 'Done' &&
          new Date(task.updatedAt).getTime() < sevenDaysAgo
      );

      if (toArchive.length > 0) {
        // Remove from active tasks
        board.tasks = board.tasks.filter(
          (task) => !toArchive.some((a) => a.id === task.id)
        );
        await this.saveInstanceBoard(name, board);
        totalArchived += toArchive.length;
      }
    }

    return { archived: totalArchived };
  }

  /**
   * Morning standup prep
   *
   * Runs every weekday at 8am to pull tasks from Backlog → Todo.
   * Helps teams prepare for the day with fresh tasks ready to work on.
   *
   * @scheduled 0 8 * * 1-5
   * @internal
   * @timeout 30s
   * @queued 1
   */
  async scheduledMorningPull(): Promise<{ pulled: number; boards: string[] }> {
    const config = loadConfig();
    const pullCount = config.morningPullCount ?? DEFAULT_MORNING_PULL_COUNT;
    const boardNames = await this.allBoardNames();
    const affectedBoards: string[] = [];
    let totalPulled = 0;

    for (const name of boardNames) {
      const board = await this.loadInstanceBoard(name);
      let pulledFromBoard = 0;

      // Find eligible tasks in Backlog (not blocked, by priority)
      for (let i = 0; i < pullCount; i++) {
        const next = this.findNextPullableTask(board, 'Backlog');
        if (!next) break;

        next.column = 'Todo';
        next.updatedAt = new Date().toISOString();
        pulledFromBoard++;
      }

      if (pulledFromBoard > 0) {
        await this.saveInstanceBoard(name, board);
        affectedBoards.push(board.name);
        totalPulled += pulledFromBoard;

        this.emit({
          emit: 'toast',
          message: `☀️ Morning prep: ${pulledFromBoard} tasks moved to Todo [${board.name}]`,
        });
        this.emit({ emit: 'board-update', board: board.name });
      }
    }

    return { pulled: totalPulled, boards: affectedBoards };
  }

  /**
   * Time-based auto-release for cards with autoReleaseMinutes set
   *
   * Checks every 5 minutes for Backlog cards that have an auto-release
   * interval configured. If the interval has passed since lastReleaseAttempt,
   * the card is moved to In Progress (respecting WIP limit).
   *
   * @scheduled 0/5 * * * *
   * @internal
   * @timeout 30s
   * @queued 1
   */
  async scheduledAutoRelease(): Promise<{ released: number; boards: string[] }> {
    const boardNames = await this.allBoardNames();
    const now = Date.now();
    const affectedBoards: string[] = [];
    let totalReleased = 0;

    for (const name of boardNames) {
      const board = await this.loadInstanceBoard(name);
      const config = loadConfig();
      const wipLimit = config.wipLimit ?? DEFAULT_WIP_LIMIT;
      let inProgressCount = board.tasks.filter(t => t.column === 'In Progress').length;

      if (inProgressCount >= wipLimit) continue;

      // Find cards with autoReleaseMinutes set, not blocked, interval passed
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const candidates = board.tasks
        .filter(t =>
          t.column === 'Backlog' &&
          t.autoReleaseMinutes !== undefined &&
          !this.isTaskBlocked(t, board)
        )
        .filter(t => {
          const lastAttempt = t.lastReleaseAttempt ? new Date(t.lastReleaseAttempt).getTime() : 0;
          const intervalMs = (t.autoReleaseMinutes ?? 60) * 60 * 1000;
          return (now - lastAttempt) >= intervalMs;
        })
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      let boardChanged = false;
      for (const task of candidates) {
        if (inProgressCount >= wipLimit) break;

        // Update lastReleaseAttempt
        task.lastReleaseAttempt = new Date().toISOString();

        // Move to In Progress
        const oldColumn = task.column;
        task.column = 'In Progress';
        task.updatedAt = new Date().toISOString();

        // Move to top of In Progress
        const taskIndex = board.tasks.findIndex(t => t.id === task.id);
        board.tasks.splice(taskIndex, 1);
        const firstInProgress = board.tasks.findIndex(t => t.column === 'In Progress');
        if (firstInProgress === -1) {
          board.tasks.push(task);
        } else {
          board.tasks.splice(firstInProgress, 0, task);
        }

        inProgressCount++;
        totalReleased++;
        boardChanged = true;

        this.emit({
          emit: 'toast',
          message: `⏰ Auto-released "${task.title}" to In Progress`,
        });
        this.emit({
          channel: `kanban:${board.name}`,
          event: 'task-auto-released',
          data: { task, from: oldColumn },
        });
      }

      if (boardChanged) {
        await this.saveInstanceBoard(name, board);
        affectedBoards.push(board.name);
        this.emit({ emit: 'board-update', board: board.name });
      }
    }

    return { released: totalReleased, boards: affectedBoards };
  }

  /**
   * Stale task cleanup
   *
   * Runs weekly on Sunday to move stale tasks (no updates in N days)
   * back to Backlog for re-prioritization.
   *
   * @scheduled 0 0 * * 0
   * @internal
   * @timeout 30s
   * @queued 1
   */
  async scheduledStaleTaskCheck(): Promise<{ moved: number; boards: string[] }> {
    const config = loadConfig();
    const staleDays = config.staleTaskDays ?? DEFAULT_STALE_TASK_DAYS;
    const staleThreshold = Date.now() - staleDays * 24 * 60 * 60 * 1000;

    const boardNames = await this.allBoardNames();
    const affectedBoards: string[] = [];
    let totalMoved = 0;

    for (const name of boardNames) {
      const board = await this.loadInstanceBoard(name);
      const staleTasks: Task[] = [];

      // Find stale tasks in Todo or In Progress
      for (const task of board.tasks) {
        if (!['Todo', 'In Progress'].includes(task.column)) continue;

        const lastUpdate = new Date(task.updatedAt).getTime();
        if (lastUpdate < staleThreshold) {
          staleTasks.push(task);
        }
      }

      if (staleTasks.length > 0) {
        for (const task of staleTasks) {
          task.column = 'Backlog';
          task.updatedAt = new Date().toISOString();

          // Add a comment about why it was moved
          if (!task.comments) task.comments = [];
          task.comments.push({
            id: this.generateId(),
            author: 'ai',
            content: `Moved to Backlog: no updates in ${staleDays} days.`,
            createdAt: new Date().toISOString(),
          });
        }

        await this.saveInstanceBoard(name, board);
        affectedBoards.push(board.name);
        totalMoved += staleTasks.length;

        this.emit({
          emit: 'toast',
          message: `🧹 Stale cleanup: ${staleTasks.length} tasks moved to Backlog [${board.name}]`,
        });
        this.emit({ emit: 'board-update', board: board.name });
      }
    }

    return { moved: totalMoved, boards: affectedBoards };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // WEBHOOKS (external integrations)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Handle GitHub webhook for issue events
   *
   * Creates or updates tasks when GitHub issues are opened/closed.
   * Configure GitHub webhook URL: POST /webhook/handleGithubIssue
   *
   * Auto-detected as webhook from 'handle' prefix.
   *
   * @internal
   * @timeout 10s
   * @retryable 2 1s
   */
  async handleGithubIssue(params: {
    action: string;
    issue: {
      number: number;
      title: string;
      body?: string;
      state: string;
      labels?: Array<{ name: string }>;
    };
    repository: {
      full_name: string;
    };
  }): Promise<{ processed: boolean; taskId?: string }> {
    // Derive board name from repo (cross-instance access by design)
    const derivedBoardName = params.repository.full_name.replace('/', '-');

    if (params.action === 'opened') {
      const board = await this.loadInstanceBoard(derivedBoardName);
      const task: Task = {
        id: this.generateId(),
        title: `#${params.issue.number}: ${params.issue.title}`,
        description: params.issue.body,
        column: 'Backlog',
        priority: 'medium',
        labels: params.issue.labels?.map((l) => l.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'webhook',
      };
      board.tasks.unshift(task);
      await this.saveInstanceBoard(derivedBoardName, board);
      this.emit({ emit: 'board-update', board: board.name });
      return { processed: true, taskId: task.id };
    }

    if (params.action === 'closed') {
      const board = await this.loadInstanceBoard(derivedBoardName);
      const task = board.tasks.find((t) =>
        t.title.startsWith(`#${params.issue.number}:`)
      );
      if (task) {
        task.column = 'Done';
        task.updatedAt = new Date().toISOString();
        await this.saveInstanceBoard(derivedBoardName, board);
        this.emit({ emit: 'board-update', board: board.name });
        return { processed: true, taskId: task.id };
      }
    }

    return { processed: false };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // LOCKED OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Batch move tasks with exclusive lock
   *
   * Move multiple tasks atomically. Uses distributed lock to prevent
   * concurrent modifications from corrupting the board.
   *
   * @locked board:write
   */
  async sweep(params: {
    taskIds: string[];
    column: string;
  }): Promise<{ moved: number }> {
    return this.withLock(`board:${this.instanceName || 'default'}:write`, async () => {
      let moved = 0;

      for (const taskId of params.taskIds) {
        const task = this.boardData.tasks.find((t) => t.id === taskId);
        if (task && this.boardData.columns.includes(params.column)) {
          task.column = params.column;
          task.updatedAt = new Date().toISOString();
          moved++;
        }
      }

      this.boardData.updatedAt = new Date().toISOString();

      this.emit({ emit: 'board-update', board: this.boardData.name });
      this.emit({
        channel: this.channel,
        event: 'batch-move',
        data: { taskIds: params.taskIds, column: params.column },
      });

      return { moved };
    });
  }
}
