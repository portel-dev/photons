/**
 * Basic Task List — stateless, in-memory
 *
 * A simple todo list that works during a session but loses state on restart.
 * Compare with tasks-live to see what @stateful adds.
 *
 * @description Stateless task list for comparison with tasks-live
 * @tags tutorial, stateless, tasks
 * @icon 📝
 */

import { PhotonMCP } from '@portel/photon-core';

export default class TasksBasic extends PhotonMCP {
  private tasks: { id: string; text: string; done: boolean }[] = [];

  /** List all tasks */
  async list() {
    return this.tasks;
  }

  /** Add a new task */
  async add(params: { text: string }) {
    this.tasks.push({ id: crypto.randomUUID(), text: params.text, done: false });
    return { added: params.text, total: this.tasks.length };
  }

  /** Complete a task by index (1-based) */
  async complete(params: { index: number }) {
    const task = this.tasks[params.index - 1];
    if (!task) return { error: 'Task not found' };
    task.done = true;
    return { completed: task.text };
  }

  /** Remove completed tasks */
  async clean() {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter(t => !t.done);
    return { removed: before - this.tasks.length, remaining: this.tasks.length };
  }
}
