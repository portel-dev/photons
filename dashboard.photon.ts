/**
 * Dashboard Photon
 *
 * A sleek dashboard demonstrating MCP Apps with UI templates.
 * Each tool returns data that can be rendered in its linked UI.
 * Data is persisted to ~/.photon/dashboard/data.json
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags dashboard, tasks, ui-templates
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface Metric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

interface DashboardData {
  tasks: Task[];
  activities: Activity[];
}

const DATA_FILE = path.join(os.homedir(), '.photon', 'dashboard', 'data.json');

const DEFAULT_DATA: DashboardData = {
  tasks: [
    { id: '1', title: 'Review pull requests', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', title: 'Update documentation', status: 'pending', priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', title: 'Fix login bug', status: 'completed', priority: 'high', createdAt: new Date().toISOString() },
    { id: '4', title: 'Deploy to staging', status: 'pending', priority: 'low', createdAt: new Date().toISOString() },
  ],
  activities: [
    { id: '1', action: 'Merged PR #42', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'alice' },
    { id: '2', action: 'Created issue #15', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'bob' },
    { id: '3', action: 'Deployed v2.1.0', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), user: 'charlie' },
  ],
};

export default class DashboardPhoton extends PhotonMCP {
  private data: DashboardData | null = null;

  private async load(): Promise<DashboardData> {
    // Always read from file to get fresh data (no caching)
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      this.data = JSON.parse(content);
    } catch {
      this.data = { ...DEFAULT_DATA };
      await this.save();
    }
    return this.data!;
  }

  private async save(): Promise<void> {
    if (!this.data) return;
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2));
  }

  private get tasks(): Task[] {
    return this.data?.tasks || [];
  }

  private get activities(): Activity[] {
    return this.data?.activities || [];
  }

  /**
   * Dashboard overview with key metrics
   *
   * Returns metrics that can be displayed in a card grid UI.
   *
   * @ui overview
   * @format json
   */
  async overview(): Promise<{
    metrics: Metric[];
    summary: { total: number; completed: number; pending: number };
  }> {
    const data = await this.load();
    const tasks = data.tasks;

    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    return {
      metrics: [
        { label: 'Total Tasks', value: tasks.length, change: 12, trend: 'up' },
        { label: 'Completed', value: completed, change: 8, trend: 'up' },
        { label: 'In Progress', value: inProgress, change: 0, trend: 'stable' },
        { label: 'Pending', value: pending, change: -3, trend: 'down' },
      ],
      summary: { total: tasks.length, completed, pending },
    };
  }

  /**
   * Dashboard main view - Task management
   *
   * @icon 📋
   * @ui tasks
   * @format list
   */
  async main(params?: {
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task[]> {
    const data = await this.load();
    let filtered = [...data.tasks];

    if (params?.status) {
      filtered = filtered.filter(t => t.status === params.status);
    }
    if (params?.priority) {
      filtered = filtered.filter(t => t.priority === params.priority);
    }

    return filtered;
  }

  /**
   * Recent activity feed
   *
   * Returns activity stream for the timeline UI.
   *
   * @ui activity
   * @format list {@title action, @subtitle user, @detail timestamp:date}
   */
  async activity(params?: { limit?: number }): Promise<Activity[]> {
    const data = await this.load();
    const limit = params?.limit || 10;
    return data.activities.slice(0, limit);
  }

  /**
   * Add a new task
   *
   * @param title Task title
   * @param priority Task priority
   * @format card
   */
  async add(params: {
    title: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const data = await this.load();

    const task: Task = {
      id: String(Date.now()),
      title: params.title,
      status: 'pending',
      priority: params.priority || 'medium',
      createdAt: new Date().toISOString(),
    };

    data.tasks.unshift(task);
    data.activities.unshift({
      id: String(Date.now()),
      action: `Created task: ${params.title}`,
      timestamp: new Date().toISOString(),
      user: 'you',
    });

    await this.save();
    return task;
  }

  /**
   * Update task status
   *
   * @param id Task ID
   * @param status New status
   * @format card
   */
  async update(params: {
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
  }): Promise<Task | null> {
    const data = await this.load();
    const task = data.tasks.find(t => t.id === params.id);
    if (!task) return null;

    task.status = params.status;
    data.activities.unshift({
      id: String(Date.now()),
      action: `Updated "${task.title}" to ${params.status}`,
      timestamp: new Date().toISOString(),
      user: 'you',
    });

    await this.save();
    return task;
  }

  /**
   * Delete a task
   *
   * @param id Task ID to delete
   * @format json
   */
  async delete(params: { id: string }): Promise<boolean> {
    const data = await this.load();
    const index = data.tasks.findIndex(t => t.id === params.id);
    if (index === -1) return false;

    const [removed] = data.tasks.splice(index, 1);
    data.activities.unshift({
      id: String(Date.now()),
      action: `Deleted task: ${removed.title}`,
      timestamp: new Date().toISOString(),
      user: 'you',
    });

    await this.save();
    return true;
  }
}
