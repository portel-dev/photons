/**
 * Jira - Issue tracking and project management
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @icon 🎫
 * @tags jira, project-management, issues
 * @dependencies axios@^1.6.0
 */

import axios, { AxiosInstance } from 'axios';

interface Issue {
  key: string;
  id: string;
  summary: string;
  status?: string;
  assignee?: string;
  priority?: string;
  created: string;
  updated: string;
}

interface Transition {
  id: string;
  name: string;
  to?: string;
}

export default class JiraPhoton {
  private api: AxiosInstance;
  private host: string;

  constructor(host: string, email: string, apiToken: string) {
    if (!host || !email || !apiToken) {
      throw new Error('Jira requires host, email, and apiToken');
    }

    this.host = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

    this.api = axios.create({
      baseURL: `https://${this.host}/rest/api/3`,
      auth: { username: email, password: apiToken },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search issues (JQL)
   * @param jql JQL query {@example project = PROJ AND status = Open}
   * @param limit Results (default: 50) {@min 1} {@max 100}
   * @param fields Fields to return (comma-separated, optional)
   * @format list {@title summary, @subtitle key, @badge status}
   * @autorun
   * @icon 🔍
   */
  async search(params: { jql: string; limit?: number; fields?: string }) {
    const response = await this.api.post('/search', {
      jql: params.jql,
      maxResults: params.limit || 50,
      fields: params.fields?.split(',') || [
        'summary',
        'status',
        'assignee',
        'priority',
        'created',
      ],
    });

    return {
      total: response.data.total,
      count: response.data.issues.length,
      issues: response.data.issues.map((i: any) => ({
        key: i.key,
        id: i.id,
        summary: i.fields.summary,
        status: i.fields.status?.name,
        assignee: i.fields.assignee?.displayName,
        priority: i.fields.priority?.name,
        created: i.fields.created,
        updated: i.fields.updated,
      })) as Issue[],
    };
  }

  /**
   * Get issue
   * @param key Issue key {@example PROJ-123}
   * @format card
   * @icon 📖
   */
  async get(params: { key: string }) {
    const response = await this.api.get(`/issue/${params.key}`);
    const issue = response.data;

    return {
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
    } as Issue & { description?: string; reporter?: string; issueType?: string; labels?: string[] };
  }

  /**
   * Create issue
   * @param project Project key {@example PROJ}
   * @param summary Title
   * @param issueType Type {@example Bug}
   * @param description Description (optional) {@field textarea}
   * @param priority Priority (optional) {@example High}
   * @param assignee Assignee ID (optional)
   * @icon ✨
   */
  async create(params: {
    project: string;
    summary: string;
    issueType: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }) {
    const fields: any = {
      project: { key: params.project },
      summary: params.summary,
      issuetype: { name: params.issueType },
    };

    if (params.description) {
      fields.description = {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: params.description }] }],
      };
    }

    if (params.priority) fields.priority = { name: params.priority };
    if (params.assignee) fields.assignee = { id: params.assignee };

    const response = await this.api.post('/issue', { fields });

    return {
      key: response.data.key,
      id: response.data.id,
      url: `https://${this.host}/browse/${response.data.key}`,
    };
  }

  /**
   * Update issue
   * @param key Issue key {@example PROJ-123}
   * @param summary New summary (optional)
   * @param description New description (optional) {@field textarea}
   * @param priority New priority (optional)
   * @param assignee New assignee ID (optional)
   * @icon ✏️
   */
  async update(params: {
    key: string;
    summary?: string;
    description?: string;
    priority?: string;
    assignee?: string;
  }) {
    const fields: any = {};

    if (params.summary) fields.summary = params.summary;

    if (params.description) {
      fields.description = {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: params.description }] }],
      };
    }

    if (params.priority) fields.priority = { name: params.priority };
    if (params.assignee) fields.assignee = { id: params.assignee };

    await this.api.put(`/issue/${params.key}`, { fields });

    return { key: params.key };
  }

  /**
   * Transition issue
   * @param key Issue key {@example PROJ-123}
   * @param transitionId Transition ID or name
   * @icon ➜
   */
  async transition(params: { key: string; transitionId: string }) {
    await this.api.post(`/issue/${params.key}/transitions`, {
      transition: { id: params.transitionId },
    });

    return { key: params.key };
  }

  /**
   * Get transitions
   * @param key Issue key {@example PROJ-123}
   * @format list {@title name, @subtitle to}
   * @autorun
   * @icon 🔀
   */
  async transitions(params: { key: string }) {
    const response = await this.api.get(`/issue/${params.key}/transitions`);

    return {
      count: response.data.transitions.length,
      transitions: response.data.transitions.map((t: any) => ({
        id: t.id,
        name: t.name,
        to: t.to?.name,
      })) as Transition[],
    };
  }

  /**
   * Add comment
   * @param key Issue key {@example PROJ-123}
   * @param text Comment text {@field textarea}
   * @icon 💬
   */
  async comment(params: { key: string; text: string }) {
    const response = await this.api.post(`/issue/${params.key}/comment`, {
      body: {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: params.text }] }],
      },
    });

    return { key: params.key, commentId: response.data.id };
  }

  /**
   * List comments
   * @param key Issue key {@example PROJ-123}
   * @param limit Results (default: 50) {@min 1} {@max 100}
   * @format list {@title body, @subtitle author, @badge created}
   * @autorun
   * @icon 💭
   */
  async comments(params: { key: string; limit?: number }) {
    const response = await this.api.get(`/issue/${params.key}/comment`, {
      params: { maxResults: params.limit || 50 },
    });

    return {
      count: response.data.comments.length,
      comments: response.data.comments.map((c: any) => ({
        id: c.id,
        author: c.author?.displayName,
        body: this._extractText(c.body),
        created: c.created,
        updated: c.updated,
      })),
    };
  }

  /**
   * List projects
   * @format list {@title name, @subtitle key, @badge projectTypeKey}
   * @autorun
   * @icon 📦
   */
  async projects() {
    const response = await this.api.get('/project');

    return {
      count: response.data.length,
      projects: response.data.map((p: any) => ({
        key: p.key,
        id: p.id,
        name: p.name,
        projectTypeKey: p.projectTypeKey,
        lead: p.lead?.displayName,
      })),
    };
  }

  /**
   * Get project
   * @param key Project key {@example PROJ}
   * @format card
   * @icon 📖
   */
  async project(params: { key: string }) {
    const response = await this.api.get(`/project/${params.key}`);
    const project = response.data;

    return {
      key: project.key,
      id: project.id,
      name: project.name,
      description: project.description,
      lead: project.lead?.displayName,
      projectTypeKey: project.projectTypeKey,
      url: project.url,
    };
  }

  private _extractText(content: any): string {
    if (!content?.content) return '';

    let text = '';
    for (const node of content.content) {
      if (node.type === 'paragraph' && node.content) {
        for (const item of node.content) {
          if (item.type === 'text') text += item.text + ' ';
        }
      }
    }
    return text.trim();
  }
}
