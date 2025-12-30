/**
 * Uptime Monitor Workflow
 * Monitors website availability and sends alerts
 *
 * This workflow demonstrates:
 * - HTTP health checks via fetch
 * - Multi-channel notifications (Slack + optional Telegram)
 * - State persistence for incident tracking
 *
 * @mcp slack anthropics/mcp-server-slack
 * @mcp filesystem anthropics/mcp-server-filesystem
 */
export default class UptimeMonitor {
  private stateFile = '/tmp/uptime-monitor-state.json';

  /**
   * Check multiple URLs and alert on failures
   * @param urls URLs to monitor
   * @param channel Slack channel for alerts
   * @param timeout Request timeout in ms
   */
  async *check(params: {
    urls: string[];
    channel: string;
    timeout?: number;
  }): AsyncGenerator<any, any, any> {
    const timeout = params.timeout || 10000;
    const results: any[] = [];

    yield { emit: 'status', message: `Checking ${params.urls.length} URLs` };

    // Load previous state
    let previousState: Record<string, boolean> = {};
    try {
      const content = await (this as any).filesystem.read_file({ path: this.stateFile });
      previousState = JSON.parse(content);
    } catch {}

    // Check each URL
    for (let i = 0; i < params.urls.length; i++) {
      const url = params.urls[i];
      yield { emit: 'status', message: `Checking: ${url}` };

      const startTime = Date.now();
      let status: 'up' | 'down' = 'down';
      let statusCode = 0;
      let responseTime = 0;
      let error: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        statusCode = response.status;
        responseTime = Date.now() - startTime;
        status = response.ok ? 'up' : 'down';
      } catch (e: any) {
        error = e.name === 'AbortError' ? 'Timeout' : e.message;
        responseTime = Date.now() - startTime;
      }

      results.push({ url, status, statusCode, responseTime, error });

      // Check for state changes
      const wasUp = previousState[url] !== false;
      const isUp = status === 'up';

      if (wasUp && !isUp) {
        // Site went DOWN - send alert
        yield { emit: 'log', level: 'error', message: `ALERT: ${url} is DOWN` };

        try {
          await (this as any).slack.post_message({
            channel: params.channel,
            text: `:red_circle: *Site Down Alert*\n` +
                  `URL: ${url}\n` +
                  `Status: ${statusCode || 'No response'}\n` +
                  `Error: ${error || 'Non-2xx status'}\n` +
                  `Time: ${new Date().toISOString()}`,
          });
        } catch (e: any) {
          yield { emit: 'log', level: 'warn', message: `Failed to send alert: ${e.message}` };
        }
      } else if (!wasUp && isUp) {
        // Site came back UP - send recovery
        yield { emit: 'log', level: 'info', message: `RECOVERED: ${url} is UP` };

        try {
          await (this as any).slack.post_message({
            channel: params.channel,
            text: `:large_green_circle: *Site Recovered*\n` +
                  `URL: ${url}\n` +
                  `Response time: ${responseTime}ms\n` +
                  `Time: ${new Date().toISOString()}`,
          });
        } catch (e: any) {
          yield { emit: 'log', level: 'warn', message: `Failed to send recovery: ${e.message}` };
        }
      }

      yield { emit: 'progress', value: (i + 1) / params.urls.length };
    }

    // Save state
    const newState: Record<string, boolean> = {};
    for (const result of results) {
      newState[result.url] = result.status === 'up';
    }
    await (this as any).filesystem.write_file({
      path: this.stateFile,
      content: JSON.stringify(newState, null, 2),
    });

    yield { emit: 'progress', value: 1.0, message: 'Check complete!' };

    const upCount = results.filter(r => r.status === 'up').length;
    const downCount = results.length - upCount;

    return {
      totalChecked: results.length,
      up: upCount,
      down: downCount,
      results,
      allHealthy: downCount === 0,
    };
  }

  /**
   * Interactive setup to configure monitoring
   */
  async *setup(): AsyncGenerator<any, any, any> {
    // Ask for URLs to monitor
    const urlsInput: string = yield {
      ask: 'text',
      id: 'urls',
      message: 'Enter URLs to monitor (comma-separated):',
    };

    const urls = urlsInput.split(',').map(u => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      return { error: 'No valid URLs provided' };
    }

    // Ask for Slack channel
    const channel: string = yield {
      ask: 'text',
      id: 'channel',
      message: 'Slack channel for alerts:',
      default: '#monitoring',
    };

    // Confirm
    const confirmed: boolean = yield {
      ask: 'confirm',
      id: 'confirm',
      message: `Monitor ${urls.length} URLs and alert to ${channel}?`,
    };

    if (!confirmed) {
      return { cancelled: true };
    }

    // Run the check
    yield* this.check({ urls, channel });
  }

  /**
   * Get uptime statistics from historical data
   */
  async stats(): Promise<any> {
    try {
      const content = await (this as any).filesystem.read_file({ path: this.stateFile });
      const state = JSON.parse(content);

      const urls = Object.keys(state);
      const upCount = Object.values(state).filter(Boolean).length;

      return {
        monitored: urls.length,
        currentlyUp: upCount,
        currentlyDown: urls.length - upCount,
        uptimePercentage: urls.length > 0 ? Math.round((upCount / urls.length) * 100) : 100,
        urls: Object.entries(state).map(([url, isUp]) => ({
          url,
          status: isUp ? 'up' : 'down',
        })),
      };
    } catch {
      return {
        monitored: 0,
        currentlyUp: 0,
        currentlyDown: 0,
        uptimePercentage: 100,
        urls: [],
        note: 'No monitoring data available yet',
      };
    }
  }
}
