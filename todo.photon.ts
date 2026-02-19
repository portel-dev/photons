/**
 * Todo List - Reactive collections in action
 *
 * Demonstrates Photon's reactive arrays: just use normal array methods (push, splice,
 * filter) and the runtime automatically emits events so connected UIs update in real-time.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon ✅
 * @tags demo, reactive, collections
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export default class TodoList extends PhotonMCP {
  /** Reactive — mutations auto-emit events to connected UIs */
  items: Task[] = [];

  /**
   * Add a new task
   * @param text {@example Buy groceries}
   * @format json
   */
  add(text: string) {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.items.push(task);
    return task;
  }

  /**
   * Mark a task as done
   * @param id Task ID
   * @format json
   */
  complete(id: string) {
    const task = this.items.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    task.done = true;
    return task;
  }

  /**
   * Remove a task
   * @param id Task ID
   * @format json
   */
  remove(id: string) {
    const index = this.items.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const [removed] = this.items.splice(index, 1);
    return removed;
  }

  /**
   * List all tasks
   * @autorun
   * @format table
   */
  list() {
    return this.items.map(t => ({
      id: t.id,
      text: t.text,
      status: t.done ? 'Done' : 'Pending',
      created: new Date(t.createdAt).toLocaleDateString(),
    }));
  }

  /**
   * Clear all completed tasks
   * @format json
   */
  clear() {
    const before = this.items.length;
    this.items = this.items.filter(t => !t.done);
    return { cleared: before - this.items.length, remaining: this.items.length };
  }
}
