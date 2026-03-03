/**
 * Todo List - Reactive collections in action
 *
 * A beautifully simple task manager showing Photon's reactive arrays.
 * Just manipulate `items` like a normal array (push, splice, map) and
 * the runtime automatically persists to disk and emits events so connected
 * UIs update in real-time. No async boilerplate needed.
 *
 * Use `@priority` to filter by importance, `@done` to filter by status.
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon ✅
 * @tags tasks, reactive, collections, todo
 * @stateful
 */

import { PhotonMCP } from '@portel/photon-core';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export default class TodoList extends PhotonMCP {
  /** Reactive — mutations auto-persist to disk and emit real-time UI updates */
  items: Task[] = [];

  /**
   * Add a new task
   * @param title {@example Buy groceries}
   * @param priority {@choice low,medium,high} {@default medium}
   * @format json
   */
  add(params: { title: string; priority?: 'low' | 'medium' | 'high' }) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: params.title,
      priority: params.priority || 'medium',
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.items.push(task);
    return task;
  }

  /**
   * Mark a task as done/incomplete
   * @param id Task ID
   * @format json
   */
  toggle(params: { id: string }) {
    const task = this.items.find(t => t.id === params.id);
    if (!task) throw new Error('Task not found');
    task.done = !task.done;
    if (task.done) {
      task.completedAt = new Date().toISOString();
    } else {
      task.completedAt = undefined;
    }
    return task;
  }

  /**
   * Update task priority
   * @param id Task ID
   * @param priority {@choice low,medium,high}
   * @format json
   */
  setPriority(params: { id: string; priority: 'low' | 'medium' | 'high' }) {
    const task = this.items.find(t => t.id === params.id);
    if (!task) throw new Error('Task not found');
    task.priority = params.priority;
    return task;
  }

  /**
   * Remove a task
   * @param id Task ID
   * @format json
   */
  remove(params: { id: string }) {
    const index = this.items.findIndex(t => t.id === params.id);
    if (index === -1) throw new Error('Task not found');
    const [removed] = this.items.splice(index, 1);
    return removed;
  }

  /**
   * List all tasks, optionally filtered by status or priority
   * @param priority {@choice low,medium,high}
   * @param done {@choice true,false}
   * @autorun
   * @format table
   */
  list(params?: { priority?: 'low' | 'medium' | 'high'; done?: boolean }) {
    return this.items
      .filter(t => params?.priority === undefined || t.priority === params.priority)
      .filter(t => params?.done === undefined || t.done === params.done)
      .map(t => ({
        title: t.title,
        priority: t.priority.toUpperCase(),
        status: t.done ? '✓ Done' : '○ Pending',
        created: new Date(t.createdAt).toLocaleDateString(),
      }));
  }

  /**
   * Get high-priority pending tasks
   * @autorun
   * @format table
   */
  urgent() {
    return this.items
      .filter(t => !t.done && t.priority === 'high')
      .map(t => ({
        title: t.title,
        priority: '🔴 HIGH',
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
    return {
      cleared: before - this.items.length,
      remaining: this.items.length
    };
  }

  /**
   * Get statistics
   * @autorun
   * @format json
   */
  stats() {
    return {
      total: this.items.length,
      pending: this.items.filter(t => !t.done).length,
      completed: this.items.filter(t => t.done).length,
      highPriority: this.items.filter(t => !t.done && t.priority === 'high').length,
    };
  }
}
