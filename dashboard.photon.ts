/**
 * Dashboard Photon
 *
 * A sleek dashboard demonstrating MCP Apps with UI templates.
 * Each tool returns data that can be rendered in its linked UI.
 *
 * @dependencies @portel/photon-core@latest
 */

import { PhotonMCP } from '@portel/photon-core';

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

export default class DashboardPhoton extends PhotonMCP {
  private tasks: Task[] = [
    { id: '1', title: 'Review pull requests', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', title: 'Update documentation', status: 'pending', priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', title: 'Fix login bug', status: 'completed', priority: 'high', createdAt: new Date().toISOString() },
    { id: '4', title: 'Deploy to staging', status: 'pending', priority: 'low', createdAt: new Date().toISOString() },
  ];

  private activities: Activity[] = [
    { id: '1', action: 'Merged PR #42', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'alice' },
    { id: '2', action: 'Created issue #15', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'bob' },
    { id: '3', action: 'Deployed v2.1.0', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), user: 'charlie' },
  ];

  /**
   * Get dashboard overview with key metrics
   *
   * Returns metrics that can be displayed in a card grid UI.
   *
   * @ui overview
   * @format json
   */
  async getOverview(): Promise<{
    metrics: Metric[];
    summary: { total: number; completed: number; pending: number };
  }> {
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const pending = this.tasks.filter(t => t.status === 'pending').length;
    const inProgress = this.tasks.filter(t => t.status === 'in_progress').length;

    return {
      metrics: [
        { label: 'Total Tasks', value: this.tasks.length, change: 12, trend: 'up' },
        { label: 'Completed', value: completed, change: 8, trend: 'up' },
        { label: 'In Progress', value: inProgress, change: 0, trend: 'stable' },
        { label: 'Pending', value: pending, change: -3, trend: 'down' },
      ],
      summary: { total: this.tasks.length, completed, pending },
    };
  }

  /**
   * Get all tasks with filtering options
   *
   * Returns task list for the task board UI.
   *
   * @ui tasks
   * @format json
   */
  async getTasks(params?: {
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task[]> {
    let filtered = [...this.tasks];

    if (params?.status) {
      filtered = filtered.filter(t => t.status === params.status);
    }
    if (params?.priority) {
      filtered = filtered.filter(t => t.priority === params.priority);
    }

    return filtered;
  }

  /**
   * Get recent activity feed
   *
   * Returns activity stream for the timeline UI.
   *
   * @ui activity
   * @format json
   */
  async getActivity(params?: { limit?: number }): Promise<Activity[]> {
    const limit = params?.limit || 10;
    return this.activities.slice(0, limit);
  }

  /**
   * Add a new task
   *
   * @param title Task title
   * @param priority Task priority
   */
  async addTask(params: {
    title: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const task: Task = {
      id: String(Date.now()),
      title: params.title,
      status: 'pending',
      priority: params.priority || 'medium',
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.activities.unshift({
      id: String(Date.now()),
      action: `Created task: ${params.title}`,
      timestamp: new Date().toISOString(),
      user: 'you',
    });

    return task;
  }

  /**
   * Update task status
   *
   * @param id Task ID
   * @param status New status
   */
  async updateTaskStatus(params: {
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
  }): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === params.id);
    if (!task) return null;

    task.status = params.status;
    this.activities.unshift({
      id: String(Date.now()),
      action: `Updated "${task.title}" to ${params.status}`,
      timestamp: new Date().toISOString(),
      user: 'you',
    });

    return task;
  }
}
