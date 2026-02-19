/**
 * Tasks Basic — Stateless task list
 *
 * A simple todo list that works during a session but loses state on restart.
 * Compare with tasks-live to see what persistence adds.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 📝
 * @tags tutorial, stateless, tasks
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default class TasksBasic extends PhotonMCP {
  private tasks: Task[] = [];

  /**
   * List all tasks
   * @format list
   * @autorun
   * @icon 📋
   */
  async list() {
    return this.tasks.map(t => ({
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
    this.tasks.push({ id: crypto.randomUUID(), text: params.text, done: false });
    this.emit('added', { text: params.text, total: this.tasks.length });
    return { added: params.text, total: this.tasks.length };
  }

  /**
   * Complete a task by index (1-based)
   * @param index Task number (1-based)
   * @icon ✅
   */
  async complete(params: { index: number }) {
    const task = this.tasks[params.index - 1];
    if (!task) {
      throw new Error(`Task ${params.index} not found`);
    }
    task.done = true;
    this.emit('completed', { text: task.text });
    return { completed: task.text };
  }

  /**
   * Remove completed tasks
   * @icon 🗑️
   */
  async clean() {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter(t => !t.done);
    return { removed: before - this.tasks.length, remaining: this.tasks.length };
  }
}
