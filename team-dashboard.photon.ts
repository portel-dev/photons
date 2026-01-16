/**
 * Team Dashboard Photon
 *
 * A TV/monitor-optimized dashboard that aggregates data from multiple photons
 * to give the whole team visibility into project progress. Perfect for office
 * displays, war rooms, or remote team syncs.
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @dependencies @portel/photon-core@latest
 * @tags dashboard, team, monitoring, tv-display
 * @icon 📺
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the photons directory - BEAM compiles to cache, so we need the source location
const PHOTONS_DIR = process.env.PHOTONS_DIR || '/Users/arul/Projects/photons';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface KanbanStats {
  total: number;
  byColumn: Record<string, number>;
  byPriority: Record<string, number>;
  byAssignee: Record<string, number>;
}

interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  relativeTime: string;
}

interface ServiceStatus {
  name: string;
  url: string;
  status: 'up' | 'down' | 'unknown';
  responseTime?: number;
  lastChecked: string;
}

interface DashboardData {
  timestamp: string;
  kanban: KanbanStats | null;
  recentCommits: GitCommit[];
  services: ServiceStatus[];
  github: GitHubStats | null;
  focus: TodaysFocus | null;
  weather?: {
    temp: string;
    condition: string;
    location: string;
  };
}

interface GitHubRepo {
  owner: string;
  repo: string;
}

interface GitHubStats {
  repos: Array<{
    name: string;
    openIssues: number;
    openPRs: number;
    oldestPRDays?: number;
  }>;
  totalIssues: number;
  totalPRs: number;
}

interface TodaysFocus {
  task: string;
  assignee?: string;
  priority: string;
}

interface DashboardConfig {
  refreshInterval: number; // seconds
  gitRepoPath?: string;
  services: Array<{ name: string; url: string }>;
  githubRepos: GitHubRepo[];
  showWeather: boolean;
  teamName: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: DashboardConfig = {
  refreshInterval: 60,
  gitRepoPath: process.cwd(),
  services: [
    { name: 'Production API', url: 'https://api.example.com/health' },
    { name: 'Staging', url: 'https://staging.example.com' },
  ],
  githubRepos: [],
  showWeather: false,
  teamName: 'Team Dashboard',
};

// ════════════════════════════════════════════════════════════════════════════════
// TEAM DASHBOARD PHOTON
// ════════════════════════════════════════════════════════════════════════════════

export default class TeamDashboardPhoton extends PhotonMCP {
  private configPath: string;
  private kanbanDataPath: string;
  private config: DashboardConfig = DEFAULT_CONFIG;

  constructor() {
    super();
    this.configPath = path.join(PHOTONS_DIR, 'team-dashboard', 'config.json');
    this.kanbanDataPath = path.join(PHOTONS_DIR, 'kanban', 'boards', 'default.json');
  }

  private async loadConfig(): Promise<DashboardConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = DEFAULT_CONFIG;
    }
    return this.config;
  }

  private async saveConfig(): Promise<void> {
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Open the Team Dashboard
   *
   * TV-optimized display showing project progress, recent activity,
   * and service health. Auto-refreshes for always-on displays.
   *
   * @ui dashboard
   */
  async main(): Promise<DashboardData> {
    return this.getDashboardData();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DATA AGGREGATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get all dashboard data
   *
   * Aggregates data from Kanban, Git, GitHub, and service monitors into a single
   * dashboard-ready payload.
   */
  async getDashboardData(): Promise<DashboardData> {
    const [kanban, commits, services, github, focus] = await Promise.all([
      this.getKanbanStats(),
      this.getRecentCommits(),
      this.checkServices(),
      this.getGitHubStats(),
      this.getTodaysFocus(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      kanban,
      recentCommits: commits,
      services,
      github,
      focus,
    };
  }

  /**
   * Debug: Show resolved paths
   */
  async getDebugPaths(): Promise<{ dirname: string; kanbanPath: string; configPath: string; exists: boolean }> {
    let exists = false;
    try {
      await fs.access(this.kanbanDataPath);
      exists = true;
    } catch {}
    return {
      dirname: __dirname,
      kanbanPath: this.kanbanDataPath,
      configPath: this.configPath,
      exists,
    };
  }

  /**
   * Get Kanban board statistics
   *
   * Reads from the Kanban photon's data file to get task counts and progress.
   */
  async getKanbanStats(): Promise<KanbanStats | null> {
    try {
      const data = await fs.readFile(this.kanbanDataPath, 'utf-8');
      const board = JSON.parse(data);

      const byColumn: Record<string, number> = {};
      const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
      const byAssignee: Record<string, number> = {};

      board.columns?.forEach((col: string) => (byColumn[col] = 0));

      board.tasks?.forEach((task: any) => {
        byColumn[task.column] = (byColumn[task.column] || 0) + 1;
        byPriority[task.priority]++;
        if (task.assignee) {
          byAssignee[task.assignee] = (byAssignee[task.assignee] || 0) + 1;
        }
      });

      return {
        total: board.tasks?.length || 0,
        byColumn,
        byPriority,
        byAssignee,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get recent Git commits
   *
   * Fetches the last 10 commits from the configured Git repository.
   */
  async getRecentCommits(): Promise<GitCommit[]> {
    await this.loadConfig();
    const repoPath = this.config.gitRepoPath || process.cwd();

    try {
      const { stdout } = await execAsync(
        `cd "${repoPath}" && git log -10 --pretty=format:"%H|%an|%ai|%s" 2>/dev/null`
      );

      if (!stdout.trim()) return [];

      const commits = stdout.trim().split('\n').map((line) => {
        const [hash, author, date, ...messageParts] = line.split('|');
        const commitDate = new Date(date);
        return {
          hash: hash.substring(0, 7),
          author,
          date,
          message: messageParts.join('|'),
          relativeTime: this.getRelativeTime(commitDate),
        };
      });

      return commits;
    } catch {
      return [];
    }
  }

  /**
   * Check service health
   *
   * Pings configured services to check if they're up or down.
   */
  async checkServices(): Promise<ServiceStatus[]> {
    await this.loadConfig();
    const results: ServiceStatus[] = [];

    for (const service of this.config.services) {
      const startTime = Date.now();
      let status: 'up' | 'down' | 'unknown' = 'unknown';
      let responseTime: number | undefined;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(service.url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        responseTime = Date.now() - startTime;
        status = response.ok ? 'up' : 'down';
      } catch {
        status = 'down';
      }

      results.push({
        name: service.name,
        url: service.url,
        status,
        responseTime,
        lastChecked: new Date().toISOString(),
      });
    }

    return results;
  }

  /**
   * Get GitHub issues and PRs from configured repos
   *
   * Fetches open issue and PR counts from all configured GitHub repositories.
   * Uses the public GitHub API (no auth required for public repos).
   */
  async getGitHubStats(): Promise<GitHubStats | null> {
    await this.loadConfig();

    if (!this.config.githubRepos || this.config.githubRepos.length === 0) {
      return null;
    }

    const repos: GitHubStats['repos'] = [];
    let totalIssues = 0;
    let totalPRs = 0;

    for (const { owner, repo } of this.config.githubRepos) {
      try {
        // Fetch repo info for issue count
        const repoResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          { headers: { 'User-Agent': 'Photon-Dashboard' } }
        );

        // Fetch open PRs
        const prsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`,
          { headers: { 'User-Agent': 'Photon-Dashboard' } }
        );

        if (repoResponse.ok && prsResponse.ok) {
          const repoData = await repoResponse.json();
          const prs = await prsResponse.json();

          // GitHub's open_issues_count includes PRs, so subtract
          const openIssues = repoData.open_issues_count - prs.length;
          const openPRs = prs.length;

          // Calculate oldest PR age
          let oldestPRDays: number | undefined;
          if (prs.length > 0) {
            const oldestPR = prs.reduce((oldest: any, pr: any) =>
              new Date(pr.created_at) < new Date(oldest.created_at) ? pr : oldest
            );
            const ageMs = Date.now() - new Date(oldestPR.created_at).getTime();
            oldestPRDays = Math.floor(ageMs / 86400000);
          }

          repos.push({
            name: `${owner}/${repo}`,
            openIssues,
            openPRs,
            oldestPRDays,
          });

          totalIssues += openIssues;
          totalPRs += openPRs;
        }
      } catch {
        // Skip failed repos
        repos.push({
          name: `${owner}/${repo}`,
          openIssues: -1,
          openPRs: -1,
        });
      }
    }

    return { repos, totalIssues, totalPRs };
  }

  /**
   * Get today's focus task
   *
   * Returns the highest priority in-progress task from the Kanban board.
   */
  async getTodaysFocus(): Promise<TodaysFocus | null> {
    try {
      const data = await fs.readFile(this.kanbanDataPath, 'utf-8');
      const board = JSON.parse(data);

      // Find tasks in progress
      const inProgressTasks = (board.tasks || []).filter(
        (t: any) => t.column === 'In Progress'
      );

      if (inProgressTasks.length === 0) return null;

      // Sort by priority (high > medium > low)
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      inProgressTasks.sort((a: any, b: any) =>
        (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      );

      const top = inProgressTasks[0];
      return {
        task: top.title,
        assignee: top.assignee,
        priority: top.priority,
      };
    } catch {
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // QUICK STATS (for AI)
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get a quick summary for AI
   *
   * Returns a text summary of the dashboard state, perfect for AI to
   * understand project status at a glance.
   */
  async getSummary(): Promise<string> {
    const data = await this.getDashboardData();
    const lines: string[] = [];

    lines.push(`📊 Dashboard Summary (${new Date().toLocaleString()})`);
    lines.push('');

    if (data.kanban) {
      const k = data.kanban;
      const done = k.byColumn['Done'] || 0;
      const inProgress = k.byColumn['In Progress'] || 0;
      const todo = k.byColumn['Todo'] || 0;
      const backlog = k.byColumn['Backlog'] || 0;

      lines.push(`📋 KANBAN: ${k.total} total tasks`);
      lines.push(`   ✅ Done: ${done} | 🔄 In Progress: ${inProgress} | 📝 Todo: ${todo} | 📦 Backlog: ${backlog}`);
      lines.push(`   🔴 High: ${k.byPriority.high} | 🟡 Medium: ${k.byPriority.medium} | 🟢 Low: ${k.byPriority.low}`);

      if (Object.keys(k.byAssignee).length > 0) {
        const assignees = Object.entries(k.byAssignee)
          .map(([name, count]) => `${name}: ${count}`)
          .join(', ');
        lines.push(`   👥 Assignees: ${assignees}`);
      }
    } else {
      lines.push('📋 KANBAN: No data available');
    }

    lines.push('');

    if (data.recentCommits.length > 0) {
      lines.push(`🔧 RECENT COMMITS (${data.recentCommits.length}):`);
      data.recentCommits.slice(0, 5).forEach((c) => {
        lines.push(`   ${c.hash} ${c.message} (${c.author}, ${c.relativeTime})`);
      });
    } else {
      lines.push('🔧 RECENT COMMITS: No commits found');
    }

    lines.push('');

    if (data.services.length > 0) {
      lines.push('🌐 SERVICES:');
      data.services.forEach((s) => {
        const icon = s.status === 'up' ? '🟢' : s.status === 'down' ? '🔴' : '⚪';
        const time = s.responseTime ? ` (${s.responseTime}ms)` : '';
        lines.push(`   ${icon} ${s.name}${time}`);
      });
    }

    return lines.join('\n');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Get dashboard configuration
   */
  async getConfig(): Promise<DashboardConfig> {
    return this.loadConfig();
  }

  /**
   * Update dashboard configuration
   */
  async updateConfig(params: Partial<DashboardConfig>): Promise<DashboardConfig> {
    await this.loadConfig();
    this.config = { ...this.config, ...params };
    await this.saveConfig();
    return this.config;
  }

  /**
   * Add a service to monitor
   */
  async addService(params: { name: string; url: string }): Promise<ServiceStatus[]> {
    await this.loadConfig();
    this.config.services.push(params);
    await this.saveConfig();
    return this.checkServices();
  }

  /**
   * Remove a service from monitoring
   */
  async removeService(params: { name: string }): Promise<{ success: boolean; services: string[] }> {
    await this.loadConfig();
    const before = this.config.services.length;
    this.config.services = this.config.services.filter((s) => s.name !== params.name);

    if (this.config.services.length < before) {
      await this.saveConfig();
      return { success: true, services: this.config.services.map((s) => s.name) };
    }

    return { success: false, services: this.config.services.map((s) => s.name) };
  }

  /**
   * Set the Git repository path
   */
  async setGitRepo(params: { path: string }): Promise<{ success: boolean; path: string }> {
    await this.loadConfig();
    this.config.gitRepoPath = params.path;
    await this.saveConfig();
    return { success: true, path: params.path };
  }

  /**
   * Set team name displayed on dashboard
   */
  async setTeamName(params: { name: string }): Promise<{ success: boolean; name: string }> {
    await this.loadConfig();
    this.config.teamName = params.name;
    await this.saveConfig();
    return { success: true, name: params.name };
  }

  /**
   * Add a GitHub repository to track
   *
   * @param repo - Repository in "owner/repo" format (e.g., "facebook/react")
   */
  async addGitHubRepo(params: { repo: string }): Promise<{ success: boolean; repos: string[] }> {
    await this.loadConfig();

    const parts = params.repo.split('/');
    if (parts.length !== 2) {
      return {
        success: false,
        repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
      };
    }

    const [owner, repo] = parts;

    // Check if already exists
    const exists = this.config.githubRepos.some(
      (r) => r.owner === owner && r.repo === repo
    );

    if (!exists) {
      this.config.githubRepos.push({ owner, repo });
      await this.saveConfig();
    }

    return {
      success: true,
      repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
    };
  }

  /**
   * Remove a GitHub repository from tracking
   *
   * @param repo - Repository in "owner/repo" format
   */
  async removeGitHubRepo(params: { repo: string }): Promise<{ success: boolean; repos: string[] }> {
    await this.loadConfig();

    const parts = params.repo.split('/');
    if (parts.length !== 2) {
      return {
        success: false,
        repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
      };
    }

    const [owner, repo] = parts;
    const before = this.config.githubRepos.length;
    this.config.githubRepos = this.config.githubRepos.filter(
      (r) => !(r.owner === owner && r.repo === repo)
    );

    if (this.config.githubRepos.length < before) {
      await this.saveConfig();
      return {
        success: true,
        repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
      };
    }

    return {
      success: false,
      repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
    };
  }

  /**
   * List all tracked GitHub repositories
   */
  async listGitHubRepos(): Promise<{ repos: string[] }> {
    await this.loadConfig();
    return {
      repos: this.config.githubRepos.map((r) => `${r.owner}/${r.repo}`),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════════════════════

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
