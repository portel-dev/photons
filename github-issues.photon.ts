/**
 * GitHub Issues - Manage GitHub repository issues
 *
 * Provides tools to list, create, update, and comment on GitHub issues.
 * Requires a GitHub personal access token with repo scope.
 *
 * Common use cases:
 * - Issue tracking: "List all open issues in my repo"
 * - Bug reporting: "Create a new bug issue with details"
 * - Issue management: "Close issue #123 and add a comment"
 *
 * Example: listIssues({ owner: "user", repo: "project", state: "open" })
 *
 * Configuration:
 * - token: GitHub personal access token (required)
 * - baseUrl: GitHub API base URL (default: https://api.github.com)
 *
 * Dependencies are auto-installed on first run.
 *
 * @dependencies @octokit/rest@^20.0.0
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import { Octokit } from '@octokit/rest';

export default class GitHubIssues {
  private octokit: Octokit;

  constructor(
    private token: string,
    private baseUrl: string = 'https://api.github.com'
  ) {
    if (!token || token.trim() === '') {
      throw new Error('GitHub token is required');
    }

    this.octokit = new Octokit({
      auth: token,
      baseUrl,
    });
  }

  async onInitialize() {
    console.error('[github-issues] ✅ Initialized');
    console.error(`[github-issues] Base URL: ${this.baseUrl}`);
  }

  /**
   * List issues in a repository
   * @param owner {@min 1} {@max 100} Repository owner (username or organization) {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param state Issue state filter (default: all) {@example open}
   * @param labels {@max 500} Comma-separated label names to filter by {@example bug,enhancement}
   * @param sort Sort by created, updated, or comments (default: created) {@example created}
   * @param per_page {@min 1} {@max 100} Number of results per page (default: 30)
   */
  async list(params: {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    per_page?: number;
  }) {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: params.owner,
        repo: params.repo,
        state: params.state || 'all',
        labels: params.labels,
        sort: params.sort || 'created',
        per_page: params.per_page || 30,
      });

      const issues = response.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        body: issue.body,
        labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
        user: issue.user?.login,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        comments: issue.comments,
        html_url: issue.html_url,
      }));

      return {
        success: true,
        count: issues.length,
        issues,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a single issue by number
   * @param owner {@min 1} {@max 100} Repository owner {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param issue_number {@min 1} Issue number {@example 42}
   */
  async get(params: { owner: string; repo: string; issue_number: number }) {
    try {
      const response = await this.octokit.issues.get({
        owner: params.owner,
        repo: params.repo,
        issue_number: params.issue_number,
      });

      const issue = response.data;

      return {
        success: true,
        issue: {
          number: issue.number,
          title: issue.title,
          state: issue.state,
          body: issue.body,
          labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
          user: issue.user?.login,
          assignees: issue.assignees?.map(a => a.login),
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          comments: issue.comments,
          html_url: issue.html_url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new issue
   * @param owner {@min 1} {@max 100} Repository owner {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param title {@min 1} {@max 200} Issue title {@example Bug in user authentication}
   * @param body {@max 5000} Issue description/body {@example Steps to reproduce: 1. Login 2. Navigate to profile}
   * @param labels {@min 1} Array of label names {@example ["bug","priority-high"]}
   * @param assignees {@min 1} Array of usernames to assign {@example ["octocat","hubot"]}
   */
  async create(params: {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }) {
    try {
      const response = await this.octokit.issues.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        body: params.body,
        labels: params.labels,
        assignees: params.assignees,
      });

      return {
        success: true,
        issue: {
          number: response.data.number,
          title: response.data.title,
          html_url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update an existing issue
   * @param owner {@min 1} {@max 100} Repository owner {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param issue_number {@min 1} Issue number to update {@example 42}
   * @param title {@min 1} {@max 200} New title (optional) {@example Updated: Bug in user authentication}
   * @param body {@max 5000} New body (optional) {@example Additional details: This also affects mobile users}
   * @param state New state: open or closed (optional) {@example closed}
   * @param labels {@min 1} New labels (optional) {@example ["bug","fixed"]}
   */
  async update(params: {
    owner: string;
    repo: string;
    issue_number: number;
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
  }) {
    try {
      const response = await this.octokit.issues.update({
        owner: params.owner,
        repo: params.repo,
        issue_number: params.issue_number,
        title: params.title,
        body: params.body,
        state: params.state,
        labels: params.labels,
      });

      return {
        success: true,
        issue: {
          number: response.data.number,
          title: response.data.title,
          state: response.data.state,
          html_url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add a comment to an issue
   * @param owner {@min 1} {@max 100} Repository owner {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param issue_number {@min 1} Issue number {@example 42}
   * @param body {@min 1} {@max 5000} Comment text {@example This issue has been fixed in the latest commit}
   */
  async comment(params: {
    owner: string;
    repo: string;
    issue_number: number;
    body: string;
  }) {
    try {
      const response = await this.octokit.issues.createComment({
        owner: params.owner,
        repo: params.repo,
        issue_number: params.issue_number,
        body: params.body,
      });

      return {
        success: true,
        comment: {
          id: response.data.id,
          body: response.data.body,
          user: response.data.user?.login,
          created_at: response.data.created_at,
          html_url: response.data.html_url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List comments on an issue
   * @param owner {@min 1} {@max 100} Repository owner {@example octocat}
   * @param repo {@min 1} {@max 100} Repository name {@example hello-world}
   * @param issue_number {@min 1} Issue number {@example 42}
   */
  async comments(params: { owner: string; repo: string; issue_number: number }) {
    try {
      const response = await this.octokit.issues.listComments({
        owner: params.owner,
        repo: params.repo,
        issue_number: params.issue_number,
      });

      const comments = response.data.map(comment => ({
        id: comment.id,
        body: comment.body,
        user: comment.user?.login,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        html_url: comment.html_url,
      }));

      return {
        success: true,
        count: comments.length,
        comments,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search issues across repositories
   * @param query {@min 1} {@max 500} Search query {@example is:open label:bug repo:octocat/hello-world}
   * @param sort Sort by created, updated, or comments (default: created) {@example created}
   * @param order Sort order: asc or desc (default: desc) {@example desc}
   * @param per_page {@min 1} {@max 100} Number of results per page (default: 30)
   */
  async search(params: {
    query: string;
    sort?: 'created' | 'updated' | 'comments';
    order?: 'asc' | 'desc';
    per_page?: number;
  }) {
    try {
      const response = await this.octokit.search.issuesAndPullRequests({
        q: params.query,
        sort: params.sort,
        order: params.order || 'desc',
        per_page: params.per_page || 30,
      });

      const issues = response.data.items.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        repository: issue.repository_url.split('/').slice(-2).join('/'),
        labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
        user: issue.user?.login,
        created_at: issue.created_at,
        html_url: issue.html_url,
      }));

      return {
        success: true,
        total_count: response.data.total_count,
        count: issues.length,
        issues,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
