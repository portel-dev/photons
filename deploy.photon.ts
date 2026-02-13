/**
 * Deploy Pipeline — Stateful Workflows + Elicitation + Progress
 *
 * Multi-step deployment pipeline that can crash and resume from the last
 * checkpoint, with human approval gates via elicitation. Steps are simulated
 * — the point is the pattern: checkpoint after side effects, ask before
 * dangerous operations, emit progress throughout.
 *
 * @description Resumable deploy pipeline with approval gates
 * @tags demo, stateful, elicitation, progress, channels
 * @icon 🚀
 * @stateful
 */

import { PhotonMCP, io, Table } from '@portel/photon-core';

interface DeployRecord {
  id: string;
  app: string;
  environment: string;
  status: 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt: string;
  steps: string[];
}

export default class Deploy extends PhotonMCP {

  /**
   * Run a deployment pipeline
   *
   * Interactive multi-step workflow with checkpoints at each stage.
   * If interrupted, re-running resumes from the last completed step.
   *
   * @stateful
   * @param app Application name {@default "my-app"}
   */
  async *run(params: {
    app?: string;
  }): AsyncGenerator<any, { status: string; environment: string; steps: string[] }> {
    const app = params.app || 'my-app';
    const completedSteps: string[] = [];
    const startedAt = new Date().toISOString();

    yield io.emit.status(`Deploying ${app}...`);

    // Step 1: Select environment
    const environment: string = yield io.ask.select(
      'Select deployment environment:',
      ['staging', 'production'],
    );
    completedSteps.push(`Selected: ${environment}`);
    yield { checkpoint: true, state: { step: 1, environment } };

    // Step 2: Lint & test
    yield io.emit.progress(0.2, 'Running linter...');
    await this.simulateWork(800);
    yield io.emit.progress(0.3, 'Running tests...');
    await this.simulateWork(1200);
    completedSteps.push('Lint & tests passed');
    yield { checkpoint: true, state: { step: 2, environment } };

    // Step 3: Build
    yield io.emit.progress(0.5, 'Building application...');
    await this.simulateWork(1500);
    completedSteps.push('Build succeeded');
    yield { checkpoint: true, state: { step: 3, environment } };

    // Step 4: Confirmation gate for production
    if (environment === 'production') {
      const confirmed: boolean = yield io.ask.confirm(
        `Deploy ${app} to PRODUCTION? This affects live users.`,
        { dangerous: true },
      );
      if (!confirmed) {
        await this.recordDeploy({ id: crypto.randomUUID(), app, environment, status: 'cancelled', startedAt, completedAt: new Date().toISOString(), steps: completedSteps });
        return { status: 'cancelled', environment, steps: completedSteps };
      }
      completedSteps.push('Production deploy confirmed');
      yield { checkpoint: true, state: { step: 4, environment } };
    }

    // Step 5: Deploy
    yield io.emit.progress(0.7, `Deploying to ${environment}...`);
    await this.simulateWork(2000);
    completedSteps.push(`Deployed to ${environment}`);
    yield { checkpoint: true, state: { step: 5, environment } };

    // Step 6: Health check
    yield io.emit.progress(0.9, 'Running health checks...');
    await this.simulateWork(1000);
    completedSteps.push('Health checks passed');

    yield io.emit.progress(1.0, 'Deploy complete!');
    yield io.emit.toast(`${app} deployed to ${environment}`, 'success');

    // Broadcast to other sessions
    this.emit({
      channel: 'deploys',
      event: 'completed',
      data: { app, environment },
    });

    // Record in history
    await this.recordDeploy({
      id: crypto.randomUUID(),
      app,
      environment,
      status: 'success',
      startedAt,
      completedAt: new Date().toISOString(),
      steps: completedSteps,
    });

    return { status: 'success', environment, steps: completedSteps };
  }

  /**
   * Show last deployment status
   */
  async status() {
    const history = await this.memory.get<DeployRecord[]>('history') ?? [];
    if (history.length === 0) return { status: 'No deployments recorded yet' };
    return history[history.length - 1];
  }

  /**
   * Deployment history
   * @param limit Number of recent deploys to show {@default 10}
   */
  async history(params?: { limit?: number }) {
    const history = await this.memory.get<DeployRecord[]>('history') ?? [];
    const recent = history.slice(-(params?.limit || 10)).reverse();

    return new Table(recent)
      .text('app')
      .badge('environment', { colors: { staging: 'blue', production: 'red' } })
      .badge('status', { colors: { success: 'green', failed: 'red', cancelled: 'gray' } })
      .datetime('completedAt');
  }

  private async recordDeploy(record: DeployRecord): Promise<void> {
    await this.memory.update<DeployRecord[]>('history', (h) => [...(h ?? []), record]);
  }

  private simulateWork(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
