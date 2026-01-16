/**
 * Kanban Board Photon
 *
 * A shared workspace for humans and AI. Visual task management where both
 * humans (via BEAM UI) and AI (via MCP methods) can create, update, and
 * move tasks. Perfect for project planning, issue tracking, and human-AI
 * collaboration.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags kanban, tasks, collaboration, project-management
 * @icon 📋
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface Task {
  id: string;
  title: string;
  description?: string;
  column: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string; // 'human', 'ai', or custom name
  labels?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface Board {
  columns: string[];
  tasks: Task[];
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_BOARD: Board = {
  columns: ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'],
  tasks: [
    {
      id: '1',
      title: 'Set up project structure',
      description: 'Initialize the repository and configure build tools',
      column: 'Done',
      priority: 'high',
      assignee: 'human',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'human',
    },
    {
      id: '2',
      title: 'Implement core features',
      description: 'Build the main functionality',
      column: 'In Progress',
      priority: 'high',
      assignee: 'ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'human',
    },
    {
      id: '3',
      title: 'Write documentation',
      description: 'Create README and API docs',
      column: 'Todo',
      priority: 'medium',
      assignee: 'ai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'human',
    },
    {
      id: '4',
      title: 'Add unit tests',
      column: 'Backlog',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════════
// KANBAN PHOTON
// ════════════════════════════════════════════════════════════════════════════════

export default class KanbanPhoton extends PhotonMCP {
  private dataPath: string;
  private board: Board | null = null;

  constructor() {
    super();
    this.dataPath = path.join(__dirname, 'kanban', 'data.json');
  }

  private async loadBoard(): Promise<Board> {
    if (this.board) return this.board;

    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.board = JSON.parse(data);
    } catch {
      this.board = { ...DEFAULT_BOARD };
      await this.saveBoard();
    }
    return this.board!;
  }

  private async saveBoard(): Promise<void> {
    if (!this.board) return;
    const dir = path.dirname(this.dataPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.dataPath, JSON.stringify(this.board, null, 2));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
  async main(): Promise<Board> {
    return this.loadBoard();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TASK METHODS (for AI)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get all tasks, optionally filtered
   *
   * Use this to understand the current state of the project, find tasks
   * assigned to you, or check what needs attention.
   *
   * @example getTasks({ assignee: 'ai' }) - Get tasks assigned to AI
   * @example getTasks({ column: 'Todo' }) - Get tasks in Todo column
   */
  async getTasks(params: {
    column?: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task[]> {
    const board = await this.loadBoard();
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

    return tasks;
  }

  /**
   * Get tasks assigned to AI
   *
   * Quickly see what tasks are waiting for AI to work on.
   */
  async getMyTasks(): Promise<Task[]> {
    const board = await this.loadBoard();
    return board.tasks.filter(
      (t) => t.assignee?.toLowerCase() === 'ai' && t.column !== 'Done'
    );
  }

  /**
   * Create a new task
   *
   * Add a task to the board. By default, tasks go to 'Backlog' column.
   * Set assignee to 'ai' for AI tasks or 'human' for human tasks.
   *
   * @example createTask({ title: 'Fix bug in login', priority: 'high', assignee: 'ai' })
   */
  async createTask(params: {
    title: string;
    description?: string;
    column?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
  }): Promise<Task> {
    const board = await this.loadBoard();

    const task: Task = {
      id: this.generateId(),
      title: params.title,
      description: params.description,
      column: params.column || 'Backlog',
      priority: params.priority || 'medium',
      assignee: params.assignee,
      labels: params.labels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'ai',
    };

    // Validate column exists
    if (!board.columns.includes(task.column)) {
      task.column = 'Backlog';
    }

    board.tasks.push(task);
    await this.saveBoard();

    return task;
  }

  /**
   * Move a task to a different column
   *
   * Update the status of a task by moving it between columns.
   * Common flow: Backlog → Todo → In Progress → Review → Done
   *
   * @example moveTask({ id: 'abc123', column: 'In Progress' })
   */
  async moveTask(params: { id: string; column: string }): Promise<Task> {
    const board = await this.loadBoard();
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
    await this.saveBoard();

    return task;
  }

  /**
   * Update a task's details
   *
   * Modify task title, description, priority, assignee, or labels.
   */
  async updateTask(params: {
    id: string;
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
  }): Promise<Task> {
    const board = await this.loadBoard();
    const task = board.tasks.find((t) => t.id === params.id);

    if (!task) {
      throw new Error(`Task not found: ${params.id}`);
    }

    if (params.title !== undefined) task.title = params.title;
    if (params.description !== undefined) task.description = params.description;
    if (params.priority !== undefined) task.priority = params.priority;
    if (params.assignee !== undefined) task.assignee = params.assignee;
    if (params.labels !== undefined) task.labels = params.labels;
    task.updatedAt = new Date().toISOString();

    await this.saveBoard();
    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(params: { id: string }): Promise<{ success: boolean; message: string }> {
    const board = await this.loadBoard();
    const index = board.tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      throw new Error(`Task not found: ${params.id}`);
    }

    const [removed] = board.tasks.splice(index, 1);
    await this.saveBoard();

    return { success: true, message: `Deleted task: ${removed.title}` };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // BOARD METHODS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get the current board state
   *
   * Returns all columns and tasks. Useful for AI to understand the full context.
   */
  async getBoard(): Promise<Board> {
    return this.loadBoard();
  }

  /**
   * Add a new column to the board
   */
  async addColumn(params: { name: string; position?: number }): Promise<string[]> {
    const board = await this.loadBoard();

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

    await this.saveBoard();
    return board.columns;
  }

  /**
   * Remove a column (moves tasks to Backlog)
   */
  async removeColumn(params: { name: string }): Promise<string[]> {
    const board = await this.loadBoard();

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
    await this.saveBoard();

    return board.columns;
  }

  /**
   * Clear completed tasks (archive them)
   */
  async clearCompleted(): Promise<{ removed: number }> {
    const board = await this.loadBoard();
    const before = board.tasks.length;
    board.tasks = board.tasks.filter((t) => t.column !== 'Done');
    const removed = before - board.tasks.length;

    await this.saveBoard();
    return { removed };
  }

  /**
   * Get board statistics
   */
  async getStats(): Promise<{
    total: number;
    byColumn: Record<string, number>;
    byPriority: Record<string, number>;
    byAssignee: Record<string, number>;
  }> {
    const board = await this.loadBoard();
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
      total: board.tasks.length,
      byColumn,
      byPriority,
      byAssignee,
    };
  }
}
