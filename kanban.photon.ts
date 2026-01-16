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
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BEAM compiles photons to a cache directory, so we need the source location
const PHOTONS_DIR = process.env.PHOTONS_DIR || '/Users/arul/Projects/photons';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

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
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface Board {
  name: string;
  columns: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface BoardMeta {
  name: string;
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
  private boardCache: Map<string, Board> = new Map();

  constructor() {
    super();
    this.boardsDir = path.join(PHOTONS_DIR, 'kanban', 'boards');
  }

  private getBoardPath(name: string): string {
    // Sanitize board name for filesystem
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.boardsDir, `${safeName}.json`);
  }

  private async loadBoard(name: string = 'default'): Promise<Board> {
    // Check cache first
    if (this.boardCache.has(name)) {
      return this.boardCache.get(name)!;
    }

    const boardPath = this.getBoardPath(name);

    try {
      const data = await fs.readFile(boardPath, 'utf-8');
      const board = JSON.parse(data) as Board;
      board.name = name; // Ensure name matches
      this.boardCache.set(name, board);
      return board;
    } catch {
      // Board doesn't exist - create it
      const board = createEmptyBoard(name);
      await this.saveBoard(board);
      this.boardCache.set(name, board);
      return board;
    }
  }

  private async saveBoard(board: Board): Promise<void> {
    board.updatedAt = new Date().toISOString();
    await fs.mkdir(this.boardsDir, { recursive: true });
    const boardPath = this.getBoardPath(board.name);
    await fs.writeFile(boardPath, JSON.stringify(board, null, 2));
    this.boardCache.set(board.name, board);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // BOARD MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════════

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
   * Create a board for a new project or conversation. Board names should be
   * descriptive (e.g., "photon-project", "auth-feature", "session-abc123").
   *
   * @example createBoard({ name: 'my-project' })
   * @example createBoard({ name: 'my-project', columns: ['Todo', 'Doing', 'Done'] })
   */
  async createBoard(params: {
    name: string;
    columns?: string[];
  }): Promise<Board> {
    const boardPath = this.getBoardPath(params.name);

    // Check if board already exists
    try {
      await fs.access(boardPath);
      throw new Error(`Board already exists: ${params.name}`);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

    const board: Board = {
      name: params.name,
      columns: params.columns || [...DEFAULT_COLUMNS],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(board);
    return board;
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
      this.boardCache.delete(params.name);
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
}
