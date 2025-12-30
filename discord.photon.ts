/**
 * Discord - Send messages and manage Discord via webhooks
 * Like n8n's Discord node - notifications, alerts, and automation
 *
 * Perfect for:
 * - Alert notifications
 * - Build/deploy notifications
 * - Automated reports
 * - Team notifications
 */
export default class Discord {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a simple text message
   * @param content Message content (max 2000 chars)
   * @param username Override the webhook's default username
   * @param avatarUrl Override the webhook's default avatar
   */
  async send(params: {
    content: string;
    username?: string;
    avatarUrl?: string;
  }) {
    const payload: any = {
      content: params.content.slice(0, 2000),
    };

    if (params.username) payload.username = params.username;
    if (params.avatarUrl) payload.avatar_url = params.avatarUrl;

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord error: ${response.status} - ${error}`);
    }

    return { sent: true, timestamp: new Date().toISOString() };
  }

  /**
   * Send a rich embed message
   * @param title Embed title
   * @param description Embed description
   * @param color Color as hex string (e.g., "#FF0000") or decimal
   * @param fields Array of {name, value, inline} objects
   * @param footer Footer text
   * @param thumbnail Thumbnail URL
   * @param image Image URL
   * @param url URL to link the title to
   */
  async embed(params: {
    title?: string;
    description?: string;
    color?: string | number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: string;
    thumbnail?: string;
    image?: string;
    url?: string;
    username?: string;
  }) {
    const embed: any = {};

    if (params.title) embed.title = params.title;
    if (params.description) embed.description = params.description.slice(0, 4096);
    if (params.url) embed.url = params.url;

    if (params.color) {
      embed.color = typeof params.color === 'string'
        ? parseInt(params.color.replace('#', ''), 16)
        : params.color;
    }

    if (params.fields) {
      embed.fields = params.fields.slice(0, 25).map(f => ({
        name: f.name.slice(0, 256),
        value: f.value.slice(0, 1024),
        inline: f.inline || false,
      }));
    }

    if (params.footer) {
      embed.footer = { text: params.footer.slice(0, 2048) };
    }

    if (params.thumbnail) {
      embed.thumbnail = { url: params.thumbnail };
    }

    if (params.image) {
      embed.image = { url: params.image };
    }

    embed.timestamp = new Date().toISOString();

    const payload: any = { embeds: [embed] };
    if (params.username) payload.username = params.username;

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discord error: ${response.status} - ${error}`);
    }

    return { sent: true, timestamp: new Date().toISOString() };
  }

  /**
   * Send an alert notification (pre-styled embed)
   * @param level Alert level: info, success, warning, error
   * @param title Alert title
   * @param message Alert message
   * @param details Optional additional details
   */
  async alert(params: {
    level: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    details?: string;
  }) {
    const colors = {
      info: 0x3498db,    // Blue
      success: 0x2ecc71, // Green
      warning: 0xf39c12, // Orange
      error: 0xe74c3c,   // Red
    };

    const emojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };

    const fields = [];
    if (params.details) {
      fields.push({
        name: 'Details',
        value: params.details.slice(0, 1024),
        inline: false,
      });
    }

    return this.embed({
      title: `${emojis[params.level]} ${params.title}`,
      description: params.message,
      color: colors[params.level],
      fields: fields.length > 0 ? fields : undefined,
    });
  }

  /**
   * Send a deployment notification
   * @param app Application name
   * @param version Version deployed
   * @param environment Deployment environment
   * @param status Deployment status
   * @param url Optional URL to the deployment
   * @param author Who triggered the deployment
   */
  async deployment(params: {
    app: string;
    version: string;
    environment: 'production' | 'staging' | 'development';
    status: 'started' | 'success' | 'failed';
    url?: string;
    author?: string;
  }) {
    const colors = {
      started: 0x3498db,
      success: 0x2ecc71,
      failed: 0xe74c3c,
    };

    const emojis = {
      started: '🚀',
      success: '✅',
      failed: '❌',
    };

    const envColors = {
      production: '🔴',
      staging: '🟡',
      development: '🟢',
    };

    const fields = [
      { name: 'Application', value: params.app, inline: true },
      { name: 'Version', value: params.version, inline: true },
      { name: 'Environment', value: `${envColors[params.environment]} ${params.environment}`, inline: true },
    ];

    if (params.author) {
      fields.push({ name: 'Deployed by', value: params.author, inline: true });
    }

    return this.embed({
      title: `${emojis[params.status]} Deployment ${params.status.charAt(0).toUpperCase() + params.status.slice(1)}`,
      description: params.url ? `[View Deployment](${params.url})` : undefined,
      color: colors[params.status],
      fields,
    });
  }

  /**
   * Send a GitHub-style commit notification
   * @param repo Repository name
   * @param branch Branch name
   * @param commits Array of {message, author, sha, url}
   * @param compareUrl URL to compare changes
   */
  async commits(params: {
    repo: string;
    branch: string;
    commits: Array<{ message: string; author: string; sha?: string; url?: string }>;
    compareUrl?: string;
  }) {
    const commitList = params.commits
      .slice(0, 10)
      .map(c => {
        const sha = c.sha ? `[\`${c.sha.slice(0, 7)}\`](${c.url}) ` : '';
        return `${sha}${c.message.split('\n')[0]} - ${c.author}`;
      })
      .join('\n');

    return this.embed({
      title: `📝 ${params.commits.length} new commit${params.commits.length > 1 ? 's' : ''} to ${params.repo}:${params.branch}`,
      description: commitList,
      color: 0x7289da,
      url: params.compareUrl,
    });
  }

  /**
   * Send a monitoring/metrics notification
   * @param title Metric title
   * @param metrics Array of {label, value, unit} objects
   * @param status Overall status
   */
  async metrics(params: {
    title: string;
    metrics: Array<{ label: string; value: string | number; unit?: string }>;
    status?: 'healthy' | 'degraded' | 'critical';
  }) {
    const colors = {
      healthy: 0x2ecc71,
      degraded: 0xf39c12,
      critical: 0xe74c3c,
    };

    const fields = params.metrics.map(m => ({
      name: m.label,
      value: `${m.value}${m.unit ? ` ${m.unit}` : ''}`,
      inline: true,
    }));

    return this.embed({
      title: `📊 ${params.title}`,
      color: params.status ? colors[params.status] : 0x3498db,
      fields,
    });
  }
}
