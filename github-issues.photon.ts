/**
 * GitHub Issues - Manage repository issues
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 🐙
 * @tags github, issues, tracking
 * @dependencies @octokit/rest@^20.0.0
 */

import { Octokit } from '@octokit/rest';

interface Issue {
  number: number;
  title: string;
  state: string;
  body?: string;
  labels: string[];
  user?: string;
  assignees?: string[];
  created_at: string;
  updated_at: string;
  comments: number;
  html_url: string;
}

interface Comment {
  id: number;
  body: string;
  user?: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export default class GitHubIssuesPhoton {
  private octokit: Octokit;

  constructor(
    private token: string,
    private baseUrl: string = 'https://api.github.com'
  ) {
    if (!token?.trim()) {
      throw new Error('GitHub token is required');
    }
    this.octokit = new Octokit({ auth: token, baseUrl });
  }

  /**
   * List issues
   * @param owner Repository owner
   * @param repo Repository name
   * @param state Filter {@choice open,closed,all} {@default open}
   * @param labels Filter labels (comma-separated)
   * @param sort Sort by {@choice created,updated,comments} {@default created}
   * @param limit Results (default: 30) {@min 1} {@max 100}
   * @format list {@title title, @subtitle number, @badge state}
   * @autorun
   * @icon 📋
   * @timeout 15s
   * @retryable 2 2s
   * @cached 2m
   */
  async list(params: {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    limit?: number;
  }) {
    const response = await this.octokit.issues.listForRepo({
      owner: params.owner,
      repo: params.repo,
      state: params.state || 'open',
      labels: params.labels,
      sort: params.sort || 'created',
      per_page: params.limit || 30,
    });

    return {
      count: response.data.length,
      issues: response.data.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        body: i.body,
        labels: i.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
        user: i.user?.login,
        created_at: i.created_at,
        updated_at: i.updated_at,
        comments: i.comments,
        html_url: i.html_url,
      })) as Issue[],
    };
  }

  /**
   * Get issue
   * @param owner Repository owner
   * @param repo Repository name
   * @param number Issue number
   * @format card
   * @icon 📖
   * @timeout 10s
   * @retryable 2 2s
   * @cached 2m
   */
  async get(params: { owner: string; repo: string; number: number }) {
    const response = await this.octokit.issues.get({
      owner: params.owner,
      repo: params.repo,
      issue_number: params.number,
    });

    const issue = response.data;
    return {
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
    } as Issue;
  }

  /**
   * Create issue
   * @param owner Repository owner
   * @param repo Repository name
   * @param title Issue title
   * @param body Description {@field textarea}
   * @param labels Label names (JSON array, optional)
   * @param assignees Assignees (JSON array, optional)
   * @icon ✨
   * @timeout 15s
   * @retryable 2 3s
   */
  async create(params: {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }) {
    const response = await this.octokit.issues.create({
      owner: params.owner,
      repo: params.repo,
      title: params.title,
      body: params.body,
      labels: params.labels,
      assignees: params.assignees,
    });

    return {
      number: response.data.number,
      title: response.data.title,
      html_url: response.data.html_url,
    };
  }

  /**
   * Update issue
   * @param owner Repository owner
   * @param repo Repository name
   * @param number Issue number
   * @param title New title (optional)
   * @param body New description (optional) {@field textarea}
   * @param state New state (optional) {@choice open,closed}
   * @param labels New labels (JSON array, optional)
   * @icon ✏️
   * @timeout 15s
   * @retryable 2 3s
   */
  async update(params: {
    owner: string;
    repo: string;
    number: number;
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
  }) {
    const response = await this.octokit.issues.update({
      owner: params.owner,
      repo: params.repo,
      issue_number: params.number,
      title: params.title,
      body: params.body,
      state: params.state,
      labels: params.labels,
    });

    return {
      number: response.data.number,
      title: response.data.title,
      state: response.data.state,
      html_url: response.data.html_url,
    };
  }

  /**
   * Add comment
   * @param owner Repository owner
   * @param repo Repository name
   * @param number Issue number
   * @param body Comment text {@field textarea}
   * @icon 💬
   * @timeout 15s
   * @retryable 2 3s
   */
  async comment(params: {
    owner: string;
    repo: string;
    number: number;
    body: string;
  }) {
    const response = await this.octokit.issues.createComment({
      owner: params.owner,
      repo: params.repo,
      issue_number: params.number,
      body: params.body,
    });

    return {
      id: response.data.id,
      body: response.data.body,
      user: response.data.user?.login,
      created_at: response.data.created_at,
      html_url: response.data.html_url,
    } as Comment;
  }

  /**
   * List comments
   * @param owner Repository owner
   * @param repo Repository name
   * @param number Issue number
   * @format list {@title body, @subtitle user, @badge created_at}
   * @autorun
   * @icon 💭
   * @timeout 15s
   * @retryable 2 2s
   * @cached 2m
   */
  async comments(params: { owner: string; repo: string; number: number }) {
    const response = await this.octokit.issues.listComments({
      owner: params.owner,
      repo: params.repo,
      issue_number: params.number,
    });

    return {
      count: response.data.length,
      comments: response.data.map(c => ({
        id: c.id,
        body: c.body,
        user: c.user?.login,
        created_at: c.created_at,
        updated_at: c.updated_at,
        html_url: c.html_url,
      })) as Comment[],
    };
  }

  /**
   * Search issues
   * @param query Search query
   * @param sort Sort by {@choice created,updated,comments}
   * @param order Order {@choice asc,desc} {@default desc}
   * @param limit Results (default: 30) {@min 1} {@max 100}
   * @format list {@title title, @subtitle repository, @badge state}
   * @icon 🔍
   * @timeout 15s
   * @retryable 2 2s
   */
  async search(params: {
    query: string;
    sort?: 'created' | 'updated' | 'comments';
    order?: 'asc' | 'desc';
    limit?: number;
  }) {
    const response = await this.octokit.search.issuesAndPullRequests({
      q: params.query,
      sort: params.sort,
      order: params.order || 'desc',
      per_page: params.limit || 30,
    });

    return {
      total: response.data.total_count,
      count: response.data.items.length,
      issues: response.data.items.map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        repository: i.repository_url.split('/').slice(-2).join('/'),
        labels: i.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
        user: i.user?.login,
        created_at: i.created_at,
        html_url: i.html_url,
      })),
    };
  }
}
