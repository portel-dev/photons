/**
 * Live Task List — stateful, reactive, persistent
 *
 * Same functionality as tasks-basic, but tasks survive restarts
 * and the UI updates in real-time via emit().
 *
 * @description Persistent reactive task list — compare with tasks-basic
 * @tags tutorial, stateful, reactive, tasks
 * @icon ✅
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const STATE_DIR = path.join(os.homedir(), '.photon', 'state', 'tasks-live');

export default class TasksLive extends PhotonMCP {
  private tasks: Task[] = [];

  constructor() {
    super();
    this.loadState();
  }

  private get statePath() {
    return path.join(STATE_DIR, 'tasks.json');
  }

  private loadState() {
    try {
      if (fs.existsSync(this.statePath)) {
        this.tasks = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
      }
    } catch {
      this.tasks = [];
    }
  }

  private saveState() {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(this.statePath, JSON.stringify(this.tasks, null, 2));
  }

  /**
   * List all tasks with visual status
   * @format list {@title text, @badge status}
   */
  async list() {
    return this.tasks.map(t => ({
      ...t,
      status: t.done ? '✓ done' : 'pending',
    }));
  }

  /** Add a new task — UI refreshes automatically */
  async add(params: { text: string }) {
    this.tasks.push({ id: crypto.randomUUID(), text: params.text, done: false });
    this.saveState();
    this.emit({ emit: 'toast', message: `Added: ${params.text}`, type: 'success' });
    return { added: params.text, total: this.tasks.length };
  }

  /** Complete a task by index (1-based) — UI refreshes automatically */
  async complete(params: { index: number }) {
    const task = this.tasks[params.index - 1];
    if (!task) return { error: 'Task not found' };
    task.done = true;
    this.saveState();
    this.emit({ emit: 'toast', message: `Completed: ${task.text}`, type: 'success' });
    return { completed: task.text };
  }

  /** Remove completed tasks */
  async clean() {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter(t => !t.done);
    this.saveState();
    this.emit({ emit: 'status', message: `Cleaned ${before - this.tasks.length} tasks` });
    return { removed: before - this.tasks.length, remaining: this.tasks.length };
  }
}
