/**
 * Todo List - Reactive collections in action
 *
 * This photon demonstrates Photon's killer feature: reactive arrays.
 * Just use normal array methods (push, splice, filter) and the runtime
 * automatically emits events so connected UIs update in real-time.
 *
 * @version 1.0.0
 * @license MIT
 * @author Portel
 * @icon ✅
 * @tags demo, reactive, collections, beginner
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export default class TodoList extends PhotonMCP {
  /** Reactive — any mutation auto-emits events to connected clients */
  items: Task[] = [];

  /**
   * Add a new task
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
   */
  complete(id: string) {
    const task = this.items.find(t => t.id === id);
    if (!task) return { error: 'Task not found' };
    task.done = true;
    return task;
  }

  /**
   * Remove a task
   */
  remove(id: string) {
    const index = this.items.findIndex(t => t.id === id);
    if (index === -1) return { error: 'Task not found' };
    const [removed] = this.items.splice(index, 1);
    return { removed };
  }

  /**
   * List all tasks
   */
  list() {
    const pending = this.items.filter(t => !t.done);
    const completed = this.items.filter(t => t.done);
    return {
      pending: pending.length,
      completed: completed.length,
      total: this.items.length,
      tasks: this.items,
    };
  }

  /**
   * Clear all completed tasks
   */
  clear() {
    const before = this.items.length;
    this.items = this.items.filter(t => !t.done);
    return { cleared: before - this.items.length, remaining: this.items.length };
  }
}
