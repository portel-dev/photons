/**
 * Jira - Project management and issue tracking
 *
 * Provides Jira operations using the official Jira REST API v3.
 * Supports issue management, projects, transitions, and comments.
 *
 * Common use cases:
 * - Issue tracking: "Create bug report", "Update issue status to In Progress"
 * - Project management: "List all projects", "Get project details"
 * - Collaboration: "Add comment to issue", "Assign issue to developer"
 *
 * Example: createIssue({ project: "PROJ", summary: "Bug in login", issueType: "Bug" })
 *
 * Configuration:
 * - host: Jira instance URL (e.g., "your-domain.atlassian.net")
 * - email: User email for authentication
 * - apiToken: API token from Jira (required)
 *
 * @dependencies axios@^1.6.0
 * @version 1.0.0
 * @author Portel
 * @license MIT
 */

import axios, { AxiosInstance } from 'axios';

export default class Jira {
  private api: AxiosInstance;
  private host: string;

  constructor(host: string, email: string, apiToken: string) {
    if (!host || !email || !apiToken) {
      throw new Error('Jira requires host, email, and apiToken');
    }

    this.host = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

    this.api = axios.create({
      baseURL: `https://${this.host}/rest/api/3`,
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  async onInitialize() {
    try {
      // Test authentication by getting current user
      const response = await this.api.get('/myself');

      console.error('[jira] ✅ Authenticated with Jira');
      console.error(`[jira] User: ${response.data.displayName} (${response.data.emailAddress})`);
      console.error(`[jira] Host: ${this.host}`);
    } catch (error: any) {
      console.error('[jira] ❌ Authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * List issues with JQL query
   * @param jql JQL query string (e.g., "project = PROJ AND status = Open")
   * @param maxResults Maximum number of results (default: 50)
   * @param fields Fields to return (optional, comma-separated)
   */
  async searchIssues(params: { jql: string; maxResults?: number; fields?: string }) {
    try {
      const response = await this.api.post('/search', {
        jql: params.jql,
        maxResults: params.maxResults || 50,
        fields: params.fields?.split(',') || ['summary', 'status', 'assignee', 'priority', 'created'],
      });

      const issues = response.data.issues.map((issue: any) => ({
        key: issue.key,
        id: issue.id,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        created: issue.fields.created,
        updated: issue.fields.updated,
      }));

      return {
        success: true,
        total: response.data.total,
        count: issues.length,
        issues,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Get issue details
   * @param issueKey Issue key (e.g., "PROJ-123")
   */
  async getIssue(params: { issueKey: string }) {
    try {
      const response = await this.api.get(`/issue/${params.issueKey}`);

      const issue = response.data;

      return {
        success: true,
        issue: {
          key: issue.key,
          id: issue.id,
          summary: issue.fields.summary,
          description: issue.fields.description,
          status: issue.fields.status?.name,
          assignee: issue.fields.assignee?.displayName,
          reporter: issue.fields.reporter?.displayName,
          priority: issue.fields.priority?.name,
          issueType: issue.fields.issuetype?.name,
          created: issue.fields.created,
          updated: issue.fields.updated,
          labels: issue.fields.labels,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Create a new issue
   * @param project Project key (e.g., "PROJ")
   * @param summary Issue title
   * @param issueType Issue type (e.g., "Bug", "Task", "Story")
   * @param description Issue description (optional)
   * @param priority Priority name (optional, e.g., "High", "Medium", "Low")
   * @param assignee Assignee account ID (optional)
   */
  async createIssue(params: {
    project: string;
    summary: string;
    issueType: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }) {
    try {
      const fields: any = {
        project: { key: params.project },
        summary: params.summary,
        issuetype: { name: params.issueType },
      };

      if (params.description) {
        fields.description = {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: params.description }],
            },
          ],
        };
      }

      if (params.priority) {
        fields.priority = { name: params.priority };
      }

      if (params.assignee) {
        fields.assignee = { id: params.assignee };
      }

      const response = await this.api.post('/issue', { fields });

      return {
        success: true,
        key: response.data.key,
        id: response.data.id,
        url: `https://${this.host}/browse/${response.data.key}`,
        message: 'Issue created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Update an issue
   * @param issueKey Issue key (e.g., "PROJ-123")
   * @param summary New summary (optional)
   * @param description New description (optional)
   * @param priority New priority (optional)
   * @param assignee New assignee account ID (optional)
   */
  async updateIssue(params: {
    issueKey: string;
    summary?: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }) {
    try {
      const fields: any = {};

      if (params.summary) {
        fields.summary = params.summary;
      }

      if (params.description) {
        fields.description = {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: params.description }],
            },
          ],
        };
      }

      if (params.priority) {
        fields.priority = { name: params.priority };
      }

      if (params.assignee) {
        fields.assignee = { id: params.assignee };
      }

      await this.api.put(`/issue/${params.issueKey}`, { fields });

      return {
        success: true,
        issueKey: params.issueKey,
        message: 'Issue updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Transition issue to new status
   * @param issueKey Issue key (e.g., "PROJ-123")
   * @param transitionId Transition ID or name
   */
  async transitionIssue(params: { issueKey: string; transitionId: string }) {
    try {
      await this.api.post(`/issue/${params.issueKey}/transitions`, {
        transition: { id: params.transitionId },
      });

      return {
        success: true,
        issueKey: params.issueKey,
        message: 'Issue transitioned successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Get available transitions for issue
   * @param issueKey Issue key (e.g., "PROJ-123")
   */
  async getTransitions(params: { issueKey: string }) {
    try {
      const response = await this.api.get(`/issue/${params.issueKey}/transitions`);

      const transitions = response.data.transitions.map((t: any) => ({
        id: t.id,
        name: t.name,
        to: t.to?.name,
      }));

      return {
        success: true,
        issueKey: params.issueKey,
        count: transitions.length,
        transitions,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Add comment to issue
   * @param issueKey Issue key (e.g., "PROJ-123")
   * @param comment Comment text
   */
  async addComment(params: { issueKey: string; comment: string }) {
    try {
      const response = await this.api.post(`/issue/${params.issueKey}/comment`, {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: params.comment }],
            },
          ],
        },
      });

      return {
        success: true,
        issueKey: params.issueKey,
        commentId: response.data.id,
        message: 'Comment added successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Get comments for issue
   * @param issueKey Issue key (e.g., "PROJ-123")
   * @param maxResults Maximum number of comments (default: 50)
   */
  async getComments(params: { issueKey: string; maxResults?: number }) {
    try {
      const response = await this.api.get(`/issue/${params.issueKey}/comment`, {
        params: { maxResults: params.maxResults || 50 },
      });

      const comments = response.data.comments.map((c: any) => ({
        id: c.id,
        author: c.author?.displayName,
        body: this._extractText(c.body),
        created: c.created,
        updated: c.updated,
      }));

      return {
        success: true,
        issueKey: params.issueKey,
        count: comments.length,
        comments,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * List all projects
   */
  async listProjects(params: {}) {
    try {
      const response = await this.api.get('/project');

      const projects = response.data.map((p: any) => ({
        key: p.key,
        id: p.id,
        name: p.name,
        projectTypeKey: p.projectTypeKey,
        lead: p.lead?.displayName,
      }));

      return {
        success: true,
        count: projects.length,
        projects,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  /**
   * Get project details
   * @param projectKey Project key (e.g., "PROJ")
   */
  async getProject(params: { projectKey: string }) {
    try {
      const response = await this.api.get(`/project/${params.projectKey}`);

      const project = response.data;

      return {
        success: true,
        project: {
          key: project.key,
          id: project.id,
          name: project.name,
          description: project.description,
          lead: project.lead?.displayName,
          projectTypeKey: project.projectTypeKey,
          url: project.url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.errorMessages?.[0] || error.message,
      };
    }
  }

  // Private helper methods

  private _extractText(content: any): string {
    if (!content || !content.content) return '';

    let text = '';
    for (const node of content.content) {
      if (node.type === 'paragraph' && node.content) {
        for (const item of node.content) {
          if (item.type === 'text') {
            text += item.text + ' ';
          }
        }
      }
    }
    return text.trim();
  }
}
