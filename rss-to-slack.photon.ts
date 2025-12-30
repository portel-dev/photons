/**
 * RSS to Slack Workflow
 * Monitors RSS feeds and posts new items to Slack
 *
 * This demonstrates:
 * 1. Using `@mcp` to declare MCP dependencies
 * 2. Generator pattern with yield for interactive workflows
 * 3. Multi-MCP orchestration in a single Photon
 *
 * @mcp slack anthropics/mcp-server-slack
 * @mcp filesystem anthropics/mcp-server-filesystem
 */
export default class RssToSlack {
  private stateFile = '/tmp/rss-to-slack-state.json';

  /**
   * Monitor an RSS feed and post new items to Slack
   * Uses generators to emit progress updates
   */
  async *monitor(params: {
    feedUrl: string;
    slackChannel: string;
    maxItems?: number;
  }): AsyncGenerator<any, any, any> {
    const maxItems = params.maxItems || 5;

    // Step 1: Emit status
    yield { emit: 'status', message: `Fetching RSS feed: ${params.feedUrl}` };

    // Step 2: Fetch the RSS feed
    const response = await fetch(params.feedUrl);
    const xml = await response.text();
    const items = this._parseRss(xml);

    yield { emit: 'progress', value: 0.3, message: `Found ${items.length} items in feed` };

    // Step 3: Load previous state
    let lastSeen: string | null = null;
    try {
      const stateContent = await (this as any).filesystem.read_file({ path: this.stateFile });
      const state = JSON.parse(stateContent);
      lastSeen = state[params.feedUrl];
    } catch {
      // No previous state
    }

    // Step 4: Find new items
    const newItems = lastSeen
      ? items.filter(item => new Date(item.pubDate) > new Date(lastSeen))
      : items.slice(0, maxItems);

    yield { emit: 'progress', value: 0.5, message: `${newItems.length} new items to post` };

    // Step 5: Post each new item to Slack
    const posted = [];
    for (let i = 0; i < Math.min(newItems.length, maxItems); i++) {
      const item = newItems[i];

      yield { emit: 'status', message: `Posting: ${item.title}` };

      try {
        await (this as any).slack.post_message({
          channel: params.slackChannel,
          text: `📰 *${item.title}*\n${item.link}\n\n${item.description?.slice(0, 200)}...`,
        });
        posted.push(item.title);
      } catch (error: any) {
        yield { emit: 'log', level: 'warn', message: `Failed to post: ${error.message}` };
      }

      yield { emit: 'progress', value: 0.5 + (0.4 * (i + 1) / newItems.length) };
    }

    // Step 6: Save state
    if (newItems.length > 0) {
      const state: Record<string, string> = {};
      try {
        const existing = await (this as any).filesystem.read_file({ path: this.stateFile });
        Object.assign(state, JSON.parse(existing));
      } catch {}

      state[params.feedUrl] = newItems[0].pubDate;
      await (this as any).filesystem.write_file({
        path: this.stateFile,
        content: JSON.stringify(state, null, 2),
      });
    }

    yield { emit: 'progress', value: 1.0, message: 'Complete!' };

    return {
      feedUrl: params.feedUrl,
      totalItems: items.length,
      newItems: newItems.length,
      posted: posted.length,
      postedTitles: posted,
    };
  }

  /**
   * Interactive setup - asks user for configuration
   */
  async *setup(): AsyncGenerator<any, any, any> {
    // Ask for feed URL
    const feedUrl: string = yield {
      ask: 'text',
      id: 'feedUrl',
      message: 'Enter the RSS feed URL to monitor:',
      pattern: '^https?://',
    };

    // Ask for Slack channel
    const channel: string = yield {
      ask: 'text',
      id: 'channel',
      message: 'Enter the Slack channel (e.g., #general):',
      default: '#general',
    };

    // Confirm
    const confirmed: boolean = yield {
      ask: 'confirm',
      id: 'confirm',
      message: `Monitor ${feedUrl} and post to ${channel}?`,
    };

    if (!confirmed) {
      return { cancelled: true };
    }

    // Run the monitor
    yield* this.monitor({ feedUrl, slackChannel: channel });
  }

  private _parseRss(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
    const items: any[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      items.push({
        title: this._extractTag(itemXml, 'title') || '',
        link: this._extractTag(itemXml, 'link') || '',
        description: this._extractTag(itemXml, 'description') || '',
        pubDate: this._extractTag(itemXml, 'pubDate') || new Date().toISOString(),
      });
    }

    return items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }

  private _extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? (match[1] || match[2] || '').trim() : null;
  }
}
