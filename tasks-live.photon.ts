/**
 * Tasks Live — Persistent reactive task list
 *
 * Same as tasks-basic but tasks survive restarts and UI updates in real-time.
 * Uses `this.memory` for zero-boilerplate persistence.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon ✅
 * @tags tutorial, stateful, reactive, tasks
 * @stateful true
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default class TasksLive extends PhotonMCP {
  /**
   * List all tasks
   * @format list
   * @autorun
   * @icon 📋
   */
  async list() {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    return tasks.map(t => ({
      ...t,
      status: t.done ? '✓ done' : 'pending',
    }));
  }

  /**
   * Add a new task
   * @param text Task description
   * @icon ➕
   */
  async add(params: { text: string }) {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    tasks.push({ id: crypto.randomUUID(), text: params.text, done: false });
    await this.memory.set('tasks', tasks);
    this.emit('added', { text: params.text, total: tasks.length });
    return { added: params.text, total: tasks.length };
  }

  /**
   * Complete a task by index (1-based)
   * @param index Task number (1-based)
   * @icon ✅
   */
  async complete(params: { index: number }) {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    const task = tasks[params.index - 1];
    if (!task) {
      throw new Error(`Task ${params.index} not found`);
    }
    task.done = true;
    await this.memory.set('tasks', tasks);
    this.emit('completed', { text: task.text });
    return { completed: task.text };
  }

  /**
   * Remove completed tasks
   * @icon 🗑️
   */
  async clean() {
    const tasks = await this.memory.get<Task[]>('tasks') ?? [];
    const remaining = tasks.filter(t => !t.done);
    await this.memory.set('tasks', remaining);
    this.emit('cleaned', { removed: tasks.length - remaining.length });
    return { removed: tasks.length - remaining.length, remaining: remaining.length };
  }
}
