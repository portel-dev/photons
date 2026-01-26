/**
 * Kanban Board Photon
 *
 * Multi-tenant task management for humans and AI. Each project/conversation
 * can have its own board. Perfect for:
 * - Project planning and task tracking
 * - AI working memory across sessions
 * - Human-AI collaboration on shared tasks
 *
 * @version 2.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags kanban, tasks, collaboration, project-management, memory
 * @icon 📋
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BEAM compiles photons to a cache directory, so we need the source location
const PHOTONS_DIR = process.env.PHOTONS_DIR || '/Users/arul/Projects/photons';

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
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface Board {
  name: string;
  projectRoot?: string; // Linked project folder path
  columns: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface BoardMeta {
  name: string;
  projectRoot?: string;
  taskCount: number;
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

export default class KanbanPhoton extends PhotonMCP {
  private boardsDir: string;
  private projectsRoot: string;

  /**
   * @param projectsRoot Root folder containing project folders (e.g., ~/Projects)
   */
  constructor(projectsRoot?: string) {
    super();
    this.boardsDir = path.join(PHOTONS_DIR, 'kanban', 'boards');
    this.projectsRoot = projectsRoot || process.env.PROJECTS_ROOT || path.join(process.env.HOME || '', 'Projects');
  }

  private getBoardPath(name: string): string {
    // Sanitize board name for filesystem
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.boardsDir, `${safeName}.json`);
  }

  private async loadBoard(name: string = 'default'): Promise<Board> {
    const boardPath = this.getBoardPath(name);

    try {
      const data = await fs.readFile(boardPath, 'utf-8');
      const board = JSON.parse(data) as Board;
      board.name = name;
      return board;
    } catch {
      // Board doesn't exist - create it
      const board = createEmptyBoard(name);
      await this.saveBoard(board);
      return board;
    }
  }

  private async saveBoard(board: Board): Promise<void> {
    board.updatedAt = new Date().toISOString();
    await fs.mkdir(this.boardsDir, { recursive: true });

    // Auto-archive: keep only last 50 in Done
    const doneTasks = board.tasks.filter(t => t.column === 'Done');
    if (doneTasks.length > 50) {
      // Sort by updatedAt desc, archive oldest
      doneTasks.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
      const toArchive = doneTasks.slice(50);
      await this.archiveTasks(board.name, toArchive);

      // Remove archived tasks from board
      const archiveIds = new Set(toArchive.map(t => t.id));
      board.tasks = board.tasks.filter(t => !archiveIds.has(t.id));
    }

    const boardPath = this.getBoardPath(board.name);
    await fs.writeFile(boardPath, JSON.stringify(board, null, 2));
  }

  private getArchivePath(boardName: string): string {
    const safeName = boardName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.boardsDir, `${safeName}.archive.jsonl`);
  }

  private async archiveTasks(boardName: string, tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return;

    const archivePath = this.getArchivePath(boardName);
    const timestamp = new Date().toISOString();

    // Append each task as a JSON line with archive metadata
    const lines = tasks.map(task =>
      JSON.stringify({ ...task, archivedAt: timestamp })
    ).join('\n') + '\n';

    await fs.appendFile(archivePath, lines);

    // Rotate: remove entries older than 30 days
    await this.rotateArchive(boardName);
  }

  private async rotateArchive(boardName: string): Promise<void> {
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

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Install Claude Code hooks in a project folder
   */
  private async installHooks(projectRoot: string): Promise<void> {
    const claudeDir = path.join(projectRoot, '.claude');
    const hooksDir = path.join(claudeDir, 'hooks');

    // Create directories
    await fs.mkdir(hooksDir, { recursive: true });

    // User prompt submit hook - logs user messages
    const userPromptHook = `#!/usr/bin/env node
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
    const boardName = path.basename(projectRoot);
    const stopHook = `#!/usr/bin/env node
/**
 * Claude Code Stop Hook - Kanban Task Enforcement
 * Blocks stopping if there are incomplete tasks or unchecked items.
 */

import { execSync } from 'child_process';

const BOARD = '${boardName}';

function hasUncheckedItems(text) {
  if (!text) return false;
  return /^[\\s]*[-*]\\s*\\[\\s*\\]/m.test(text);
}

function countCheckboxes(text) {
  if (!text) return { checked: 0, unchecked: 0 };
  const unchecked = (text.match(/^[\\s]*[-*]\\s*\\[\\s*\\]/gm) || []).length;
  const checked = (text.match(/^[\\s]*[-*]\\s*\\[[xX]\\]/gm) || []).length;
  return { checked, unchecked };
}

try {
  const result = execSync(\`photon cli kanban getMyTasks --board \${BOARD} --json\`, {
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
        reason: \`Incomplete tasks on board "\${BOARD}":\\n\${pendingDetails.join('\\n')}\\n\\nComplete all checkbox items or move tasks to Done.\`
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
  // BOARD MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * List available project folders
   *
   * Shows folders in the configured projects root that can be linked to boards.
   * Use this when creating a new board to see available projects.
   *
   * @example listProjectFolders()
   */
  async listProjectFolders(): Promise<Array<{ name: string; path: string; hasBoard: boolean }>> {
    const folders: Array<{ name: string; path: string; hasBoard: boolean }> = [];

    try {
      const entries = await fs.readdir(this.projectsRoot, { withFileTypes: true });
      const existingBoards = await this.listBoards();
      const boardNames = new Set(existingBoards.map(b => b.name));

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          folders.push({
            name: entry.name,
            path: path.join(this.projectsRoot, entry.name),
            hasBoard: boardNames.has(entry.name),
          });
        }
      }

      return folders.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return [];
    }
  }

  /**
   * List all boards
   *
   * See all available boards with task counts. Use this to find existing
   * project boards or check if a board exists.
   */
  async listBoards(): Promise<BoardMeta[]> {
    await fs.mkdir(this.boardsDir, { recursive: true });

    try {
      const files = await fs.readdir(this.boardsDir);
      const boards: BoardMeta[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const boardPath = path.join(this.boardsDir, file);
        try {
          const data = await fs.readFile(boardPath, 'utf-8');
          const board = JSON.parse(data) as Board;
          boards.push({
            name: board.name,
            projectRoot: board.projectRoot,
            taskCount: board.tasks.length,
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
          });
        } catch {
          // Skip invalid files
        }
      }

      return boards.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  /**
   * Create a new board
   *
   * Create a board linked to a project folder. If no folder specified,
   * use listProjectFolders() to see available options.
   *
   * When a folder is provided:
   * - Board name = folder name
   * - Claude Code hooks are auto-installed in the project
   * - Board is linked to the project for task tracking
   *
   * @example createBoard({ folder: 'my-project' })
   * @example createBoard({ folder: 'my-project', columns: ['Todo', 'Doing', 'Done'] })
   * @example createBoard({ folder: 'new-project', createFolder: true })
   */
  async createBoard(params: {
    name?: string;
    folder?: string;
    createFolder?: boolean;
    columns?: string[];
  }): Promise<Board> {
    // Determine board name and project root
    let boardName: string;
    let projectRoot: string | undefined;

    if (params.folder) {
      boardName = params.folder;
      projectRoot = path.join(this.projectsRoot, params.folder);

      // Check if folder exists or should be created
      if (!existsSync(projectRoot)) {
        if (params.createFolder) {
          await fs.mkdir(projectRoot, { recursive: true });
        } else {
          throw new Error(`Folder not found: ${params.folder}. Use createFolder: true to create it.`);
        }
      }
    } else if (params.name) {
      boardName = params.name;
    } else {
      throw new Error('Either name or folder must be provided');
    }

    const boardPath = this.getBoardPath(boardName);

    // Check if board already exists
    try {
      await fs.access(boardPath);
      throw new Error(`Board already exists: ${boardName}`);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

    const board: Board = {
      name: boardName,
      projectRoot: projectRoot,
      columns: params.columns || [...DEFAULT_COLUMNS],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(board);

    // Auto-install hooks if linked to a project folder
    if (projectRoot) {
      await this.installHooks(projectRoot);
    }

    return board;
  }

  /**
   * Link an existing board to a project folder
   *
   * Use this to link a board that was created without a folder,
   * or to regenerate hooks for an existing project.
   *
   * @example linkProject({ board: 'photon', folder: 'photon' })
   */
  async linkProject(params: {
    board: string;
    folder: string;
  }): Promise<{ success: boolean; projectRoot: string }> {
    const board = await this.loadBoard(params.board);
    const projectRoot = path.join(this.projectsRoot, params.folder);

    if (!existsSync(projectRoot)) {
      throw new Error(`Folder not found: ${params.folder}`);
    }

    board.projectRoot = projectRoot;
    await this.saveBoard(board);
    await this.installHooks(projectRoot);

    return { success: true, projectRoot };
  }

  /**
   * Delete a board
   *
   * Permanently remove a board and all its tasks. Use with caution!
   */
  async deleteBoard(params: { name: string }): Promise<{ success: boolean; message: string }> {
    if (params.name === 'default') {
      throw new Error('Cannot delete the default board');
    }

    const boardPath = this.getBoardPath(params.name);

    try {
      await fs.unlink(boardPath);
      return { success: true, message: `Deleted board: ${params.name}` };
    } catch {
      throw new Error(`Board not found: ${params.name}`);
    }
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
   * @ui board
   */
  async main(params?: { board?: string }): Promise<Board> {
    return this.loadBoard(params?.board || 'default');
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
   * @example getTasks({ board: 'my-project', assignee: 'ai' })
   * @example getTasks({ column: 'Todo' })
   */
  async getTasks(params: {
    board?: string;
    column?: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
    label?: string;
  }): Promise<Task[]> {
    const board = await this.loadBoard(params.board);
    let tasks = [...board.tasks];

    if (params.column) {
      tasks = tasks.filter((t) => t.column.toLowerCase() === params.column!.toLowerCase());
    }
    if (params.assignee) {
      tasks = tasks.filter((t) => t.assignee?.toLowerCase() === params.assignee!.toLowerCase());
    }
    if (params.priority) {
      tasks = tasks.filter((t) => t.priority === params.priority);
    }
    if (params.label) {
      tasks = tasks.filter((t) => t.labels?.includes(params.label!));
    }

    return tasks;
  }

  /**
   * Get tasks assigned to AI
   *
   * Quickly see what tasks are waiting for AI to work on.
   */
  async getMyTasks(params?: { board?: string }): Promise<Task[]> {
    const board = await this.loadBoard(params?.board);
    return board.tasks.filter(
      (t) => t.assignee?.toLowerCase() === 'ai' && t.column !== 'Done'
    );
  }

  /**
   * Create a new task
   *
   * Add a task to the board. By default, tasks go to 'Backlog' column.
   * Use 'context' to store AI reasoning or notes for memory.
   *
   * @example createTask({ board: 'my-project', title: 'Fix bug', priority: 'high' })
   * @example createTask({ title: 'Research auth', context: 'User wants JWT with refresh tokens', links: ['/src/auth/'] })
   */
  async createTask(params: {
    board?: string;
    title: string;
    description?: string;
    column?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
    context?: string;
    links?: string[];
  }): Promise<Task> {
    const board = await this.loadBoard(params.board);

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'ai',
    };

    // Validate column exists
    if (!board.columns.includes(task.column)) {
      task.column = 'Backlog';
    }

    board.tasks.push(task);
    await this.saveBoard(board);

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'task-created', data: { task } });

    // Notify Claude Code if task is assigned to AI
    if (task.assignee === 'ai') {
      this.emit({ emit: 'status', type: 'info', message: `New task assigned: ${task.title} [${board.name}]` });
    }

    return task;
  }

  /**
   * Move a task to a different column
   *
   * Update the status of a task by moving it between columns.
   * Common flow: Backlog → Todo → In Progress → Review → Done
   *
   * @example moveTask({ board: 'my-project', id: 'abc123', column: 'In Progress' })
   */
  async moveTask(params: { board?: string; id: string; column: string }): Promise<Task> {
    const board = await this.loadBoard(params.board);
    const task = board.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    // Validate column exists
    if (!board.columns.includes(params.column)) {
      throw new Error(`Invalid column: ${params.column}. Available: ${board.columns.join(', ')}`);
    }

    task.column = params.column;
    task.updatedAt = new Date().toISOString();
    await this.saveBoard(board);

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'task-moved', data: { task } });

    return task;
  }

  /**
   * Reorder a task within or across columns
   *
   * Move a task to a specific position. Use `beforeId` to place before another task,
   * or omit to place at the end of the column. Array order = display order.
   *
   * @example reorderTask({ id: 'abc', column: 'Todo', beforeId: 'xyz' }) // Place before xyz
   * @example reorderTask({ id: 'abc', column: 'Done' }) // Move to end of Done
   */
  async reorderTask(params: {
    board?: string;
    id: string;
    column: string;
    beforeId?: string;
  }): Promise<Task> {
    const board = await this.loadBoard(params.board);
    const taskIndex = board.tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      throw new Error(`Task not found: ${params.id}`);
    }

    // Validate column exists
    if (!board.columns.includes(params.column)) {
      throw new Error(`Invalid column: ${params.column}. Available: ${board.columns.join(', ')}`);
    }

    // Remove task from current position
    const [task] = board.tasks.splice(taskIndex, 1);
    task.column = params.column;
    task.updatedAt = new Date().toISOString();

    // Find insert position
    if (params.beforeId) {
      const beforeIndex = board.tasks.findIndex((t) => t.id === params.beforeId);
      if (beforeIndex === -1) {
        // beforeId not found, append to end
        board.tasks.push(task);
      } else {
        board.tasks.splice(beforeIndex, 0, task);
      }
    } else {
      // No beforeId - append to end of the column
      // Find the last task in this column and insert after it
      let insertIndex = board.tasks.length;
      for (let i = board.tasks.length - 1; i >= 0; i--) {
        if (board.tasks[i].column === params.column) {
          insertIndex = i + 1;
          break;
        }
      }
      board.tasks.splice(insertIndex, 0, task);
    }

    await this.saveBoard(board);

    // Notify connected UIs
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'task-reordered', data: { task } });

    return task;
  }

  /**
   * Update a task's details
   *
   * Modify task title, description, priority, assignee, labels, or context.
   */
  async updateTask(params: {
    board?: string;
    id: string;
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
    context?: string;
    links?: string[];
  }): Promise<Task> {
    const board = await this.loadBoard(params.board);
    const task = board.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    if (params.title !== undefined) task.title = params.title;
    if (params.description !== undefined) task.description = params.description;
    if (params.priority !== undefined) task.priority = params.priority;
    if (params.assignee !== undefined) task.assignee = params.assignee;
    if (params.labels !== undefined) task.labels = params.labels;
    if (params.context !== undefined) task.context = params.context;
    if (params.links !== undefined) task.links = params.links;
    task.updatedAt = new Date().toISOString();

    await this.saveBoard(board);

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'task-updated', data: { task } });

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(params: { board?: string; id: string }): Promise<{ success: boolean; message: string }> {
    const board = await this.loadBoard(params.board);
    const index = board.tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      throw new Error(`Task not found: ${params.id}`);
    }

    const [removed] = board.tasks.splice(index, 1);
    await this.saveBoard(board);

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'task-deleted', data: { taskId: removed.id } });

    return { success: true, message: `Deleted task: ${removed.title}` };
  }

  /**
   * Search tasks across all boards or within a specific board
   *
   * Find tasks by keyword in title, description, or context.
   */
  async searchTasks(params: {
    query: string;
    board?: string;
  }): Promise<Array<Task & { board: string }>> {
    const query = params.query.toLowerCase();
    const results: Array<Task & { board: string }> = [];

    if (params.board) {
      // Search specific board
      const board = await this.loadBoard(params.board);
      for (const task of board.tasks) {
        if (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.context?.toLowerCase().includes(query)
        ) {
          results.push({ ...task, board: board.name });
        }
      }
    } else {
      // Search all boards
      const boards = await this.listBoards();
      for (const meta of boards) {
        const board = await this.loadBoard(meta.name);
        for (const task of board.tasks) {
          if (
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.context?.toLowerCase().includes(query)
          ) {
            results.push({ ...task, board: board.name });
          }
        }
      }
    }

    return results;
  }

  /**
   * Add a comment to a task
   *
   * Use comments for instructions, updates, questions, and conversation.
   * Both humans and AI can add comments to track progress and communicate.
   *
   * @example addComment({ id: 'abc123', content: 'Please use JWT for auth', author: 'human' })
   * @example addComment({ id: 'abc123', content: 'Implemented JWT with refresh tokens', author: 'ai' })
   */
  async addComment(params: {
    board?: string;
    id: string;
    content: string;
    author?: 'human' | 'ai';
  }): Promise<Comment> {
    const board = await this.loadBoard(params.board);
    const task = board.tasks.find((t) => t.id === params.id);

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

    await this.saveBoard(board);

    // Notify connected UIs of the change (both in-process and cross-process)
    this.emit({ emit: 'board-update', board: board.name });
    this.emit({ channel: `kanban:${board.name}`, event: 'comment-added', data: { taskId: task.id, comment } });

    return comment;
  }

  /**
   * Get comments for a task
   *
   * Retrieve all comments/conversation for a specific task.
   */
  async getComments(params: {
    board?: string;
    id: string;
  }): Promise<Comment[]> {
    const board = await this.loadBoard(params.board);
    const task = board.tasks.find((t) => t.id === params.id);

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
  async getTask(params: {
    board?: string;
    id: string;
  }): Promise<Task> {
    const board = await this.loadBoard(params.board);
    const task = board.tasks.find((t) => t.id === params.id);

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
  async getBoard(params?: { board?: string }): Promise<Board> {
    return this.loadBoard(params?.board);
  }

  /**
   * Get the most recently active board
   *
   * Returns the board that was most recently updated (by AI or humans).
   * Useful for AI to know which project currently needs attention,
   * and for the UI "Auto" mode to follow activity across boards.
   *
   * @example const active = await getActiveBoard();
   */
  async getActiveBoard(): Promise<Board> {
    const boards = await this.listBoards();
    if (boards.length === 0) {
      return this.loadBoard('default');
    }

    // Sort by updatedAt descending, get most recent
    boards.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return this.loadBoard(boards[0].name);
  }

  /**
   * Add a new column to the board
   */
  async addColumn(params: { board?: string; name: string; position?: number }): Promise<string[]> {
    const board = await this.loadBoard(params.board);

    if (board.columns.includes(params.name)) {
      throw new Error(`Column already exists: ${params.name}`);
    }

    if (params.position !== undefined) {
      board.columns.splice(params.position, 0, params.name);
    } else {
      // Insert before 'Done' by default
      const doneIndex = board.columns.indexOf('Done');
      if (doneIndex > -1) {
        board.columns.splice(doneIndex, 0, params.name);
      } else {
        board.columns.push(params.name);
      }
    }

    await this.saveBoard(board);
    return board.columns;
  }

  /**
   * Remove a column (moves tasks to Backlog)
   */
  async removeColumn(params: { board?: string; name: string }): Promise<string[]> {
    const board = await this.loadBoard(params.board);

    if (['Backlog', 'Done'].includes(params.name)) {
      throw new Error(`Cannot remove ${params.name} column`);
    }

    const index = board.columns.indexOf(params.name);
    if (index === -1) {
      throw new Error(`Column not found: ${params.name}`);
    }

    // Move tasks from this column to Backlog
    board.tasks.forEach((task) => {
      if (task.column === params.name) {
        task.column = 'Backlog';
      }
    });

    board.columns.splice(index, 1);
    await this.saveBoard(board);

    return board.columns;
  }

  /**
   * Clear completed tasks (archive them)
   */
  async clearCompleted(params?: { board?: string }): Promise<{ removed: number }> {
    const board = await this.loadBoard(params?.board);
    const before = board.tasks.length;
    board.tasks = board.tasks.filter((t) => t.column !== 'Done');
    const removed = before - board.tasks.length;

    await this.saveBoard(board);
    return { removed };
  }

  /**
   * Get board statistics
   */
  async getStats(params?: { board?: string }): Promise<{
    board: string;
    total: number;
    byColumn: Record<string, number>;
    byPriority: Record<string, number>;
    byAssignee: Record<string, number>;
  }> {
    const board = await this.loadBoard(params?.board);
    const byColumn: Record<string, number> = {};
    const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const byAssignee: Record<string, number> = {};

    board.columns.forEach((col) => (byColumn[col] = 0));

    board.tasks.forEach((task) => {
      byColumn[task.column] = (byColumn[task.column] || 0) + 1;
      byPriority[task.priority]++;
      if (task.assignee) {
        byAssignee[task.assignee] = (byAssignee[task.assignee] || 0) + 1;
      }
    });

    return {
      board: board.name,
      total: board.tasks.length,
      byColumn,
      byPriority,
      byAssignee,
    };
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
   */
  async scheduledArchiveOldTasks(): Promise<{ archived: number }> {
    const boards = await this.listBoards();
    let totalArchived = 0;

    for (const boardMeta of boards) {
      const board = await this.loadBoard(boardMeta.name);
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
        await this.saveBoard(board);
        totalArchived += toArchive.length;
      }
    }

    return { archived: totalArchived };
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
    const boardName = params.repository.full_name.replace('/', '-');

    if (params.action === 'opened') {
      const task = await this.createTask({
        board: boardName,
        title: `#${params.issue.number}: ${params.issue.title}`,
        description: params.issue.body,
        labels: params.issue.labels?.map((l) => l.name),
        column: 'Backlog',
      });
      return { processed: true, taskId: task.id };
    }

    if (params.action === 'closed') {
      // Find and move the task to Done
      const board = await this.loadBoard(boardName);
      const task = board.tasks.find((t) =>
        t.title.startsWith(`#${params.issue.number}:`)
      );
      if (task) {
        await this.moveTask({ board: boardName, id: task.id, column: 'Done' });
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
   * Option 1: Use @locked tag (entire method locked)
   * @locked board:write
   *
   * Option 2: Use this.withLock() for fine-grained control (shown below)
   */
  async batchMoveTasks(params: {
    board?: string;
    taskIds: string[];
    column: string;
  }): Promise<{ moved: number }> {
    // Using withLock for dynamic lock name based on board
    return this.withLock(`board:${params.board || 'default'}:write`, async () => {
      const board = await this.loadBoard(params.board);
      let moved = 0;

      for (const taskId of params.taskIds) {
        const task = board.tasks.find((t) => t.id === taskId);
        if (task && board.columns.includes(params.column)) {
          task.column = params.column;
          task.updatedAt = new Date().toISOString();
          moved++;
        }
      }

      await this.saveBoard(board);

      this.emit({ emit: 'board-update', board: board.name });
      this.emit({
        channel: `kanban:${board.name}`,
        event: 'batch-move',
        data: { taskIds: params.taskIds, column: params.column },
      });

      return { moved };
    });
  }
}
// test Sat 24 Jan 2026 22:58:03 +08
