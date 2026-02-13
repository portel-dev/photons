/**
 * Live Task List — stateful, reactive, persistent
 *
 * Same functionality as tasks-basic, but tasks survive restarts
 * and the UI updates in real-time via emit().
 *
 * Uses `this.memory` for zero-boilerplate persistence — compare with
 * tasks-basic to see the difference (no fs/path/os imports needed).
 *
 * @description Persistent reactive task list — compare with tasks-basic
 * @tags tutorial, stateful, reactive, tasks
 * @icon ✅
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default class TasksLive extends PhotonMCP {

  /**
   * List all tasks with visual status
   * @format list {@title text, @badge status}
   */
  async list() {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    return tasks.map(t => ({
      ...t,
      status: t.done ? '✓ done' : 'pending',
    }));
  }

  /** Add a new task — UI refreshes automatically */
  async add(params: { text: string }) {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    tasks.push({ id: crypto.randomUUID(), text: params.text, done: false });
    await this.memory.set('tasks', tasks);
    this.emit({ emit: 'toast', message: `Added: ${params.text}`, type: 'success' });
    return { added: params.text, total: tasks.length };
  }

  /** Complete a task by index (1-based) — UI refreshes automatically */
  async complete(params: { index: number }) {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    const task = tasks[params.index - 1];
    if (!task) return { error: 'Task not found' };
    task.done = true;
    await this.memory.set('tasks', tasks);
    this.emit({ emit: 'toast', message: `Completed: ${task.text}`, type: 'success' });
    return { completed: task.text };
  }

  /** Remove completed tasks */
  async clean() {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    const remaining = tasks.filter(t => !t.done);
    await this.memory.set('tasks', remaining);
    this.emit({ emit: 'status', message: `Cleaned ${tasks.length - remaining.length} tasks` });
    return { removed: tasks.length - remaining.length, remaining: remaining.length };
  }
}
