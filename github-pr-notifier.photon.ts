/**
 * GitHub PR Notifier Workflow
 * Monitors GitHub PRs and sends notifications to Slack
 *
 * This workflow demonstrates:
 * - Multi-MCP orchestration (GitHub + Slack)
 * - Generator pattern for progress updates
 * - State management via filesystem MCP
 *
 * @mcp github anthropics/mcp-server-github
 * @mcp slack anthropics/mcp-server-slack
 * @mcp filesystem anthropics/mcp-server-filesystem
 */
export default class GitHubPRNotifier {
  private stateFile = '/tmp/github-pr-notifier-state.json';

  /**
   * Monitor a repository for new PRs and notify Slack
   * @param owner Repository owner
   * @param repo Repository name
   * @param channel Slack channel to notify
   * @param labels Optional: only notify for PRs with these labels
   */
  async *monitor(params: {
    owner: string;
    repo: string;
    channel: string;
    labels?: string[];
  }): AsyncGenerator<any, any, any> {
    yield { emit: 'status', message: `Checking PRs for ${params.owner}/${params.repo}` };

    // Step 1: Fetch open PRs from GitHub
    const prs = await (this as any).github.list_pull_requests({
      owner: params.owner,
      repo: params.repo,
      state: 'open',
    });

    yield { emit: 'progress', value: 0.3, message: `Found ${prs.length} open PRs` };

    // Step 2: Load previous state to find new PRs
    let previousPRs: number[] = [];
    try {
      const stateContent = await (this as any).filesystem.read_file({ path: this.stateFile });
      const state = JSON.parse(stateContent);
      previousPRs = state[`${params.owner}/${params.repo}`] || [];
    } catch {
      // No previous state
    }

    // Step 3: Find new PRs
    const newPRs = prs.filter((pr: any) => !previousPRs.includes(pr.number));

    // Filter by labels if specified
    const filteredPRs = params.labels?.length
      ? newPRs.filter((pr: any) =>
          pr.labels?.some((label: any) => params.labels!.includes(label.name))
        )
      : newPRs;

    yield { emit: 'progress', value: 0.5, message: `${filteredPRs.length} new PRs to notify` };

    // Step 4: Notify Slack for each new PR
    const notified = [];
    for (let i = 0; i < filteredPRs.length; i++) {
      const pr = filteredPRs[i];

      yield { emit: 'status', message: `Notifying: PR #${pr.number}` };

      try {
        await (this as any).slack.post_message({
          channel: params.channel,
          text: `*New PR in ${params.owner}/${params.repo}*\n` +
                `#${pr.number}: ${pr.title}\n` +
                `By: ${pr.user?.login || 'unknown'}\n` +
                `${pr.html_url}`,
        });
        notified.push(pr.number);
      } catch (error: any) {
        yield { emit: 'log', level: 'warn', message: `Failed to notify: ${error.message}` };
      }

      yield { emit: 'progress', value: 0.5 + (0.4 * (i + 1) / filteredPRs.length) };
    }

    // Step 5: Save state
    const state: Record<string, number[]> = {};
    try {
      const existing = await (this as any).filesystem.read_file({ path: this.stateFile });
      Object.assign(state, JSON.parse(existing));
    } catch {}

    state[`${params.owner}/${params.repo}`] = prs.map((pr: any) => pr.number);
    await (this as any).filesystem.write_file({
      path: this.stateFile,
      content: JSON.stringify(state, null, 2),
    });

    yield { emit: 'progress', value: 1.0, message: 'Complete!' };

    return {
      repo: `${params.owner}/${params.repo}`,
      totalOpenPRs: prs.length,
      newPRs: filteredPRs.length,
      notified: notified.length,
      prNumbers: notified,
    };
  }

  /**
   * Get a summary of open PRs across multiple repos
   * @param repos Array of owner/repo strings
   */
  async *summary(params: {
    repos: string[];
  }): AsyncGenerator<any, any, any> {
    const results: any[] = [];

    for (let i = 0; i < params.repos.length; i++) {
      const [owner, repo] = params.repos[i].split('/');
      yield { emit: 'status', message: `Checking ${owner}/${repo}` };

      try {
        const prs = await (this as any).github.list_pull_requests({
          owner,
          repo,
          state: 'open',
        });

        results.push({
          repo: params.repos[i],
          openPRs: prs.length,
          oldest: prs[prs.length - 1]?.created_at,
          reviewNeeded: prs.filter((pr: any) => pr.requested_reviewers?.length > 0).length,
        });
      } catch (error: any) {
        results.push({
          repo: params.repos[i],
          error: error.message,
        });
      }

      yield { emit: 'progress', value: (i + 1) / params.repos.length };
    }

    return {
      repos: results,
      totalOpenPRs: results.reduce((sum, r) => sum + (r.openPRs || 0), 0),
    };
  }
}
