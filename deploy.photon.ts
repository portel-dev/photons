/**
 * Deploy Pipeline - Multi-step workflow with checkpoints and approval gates
 *
 * @description Resumable deployment pipeline with elicitation
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags demo, stateful, elicitation, progress
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
   * Run deployment pipeline
   * Multi-step workflow with checkpoints. Resumable if interrupted.
   * @param app Application name {@default "my-app"}
   * @stateful
   */
  async *run(params: { app?: string }): AsyncGenerator<any, { status: string; environment: string; steps: string[] }> {
    const app = params.app || 'my-app';
    const steps: string[] = [];
    const startedAt = new Date().toISOString();

    yield io.emit.status(`Deploying ${app}...`);

    const environment = yield io.ask.select(
      'Select deployment environment:',
      ['staging', 'production'],
    );
    steps.push(`Selected: ${environment}`);
    yield { checkpoint: true, state: { step: 1, environment } };

    yield io.emit.progress(0.2, 'Running linter...');
    await this.sleep(800);
    yield io.emit.progress(0.3, 'Running tests...');
    await this.sleep(1200);
    steps.push('Lint & tests passed');
    yield { checkpoint: true, state: { step: 2, environment } };

    yield io.emit.progress(0.5, 'Building application...');
    await this.sleep(1500);
    steps.push('Build succeeded');
    yield { checkpoint: true, state: { step: 3, environment } };

    if (environment === 'production') {
      const confirmed = yield io.ask.confirm(
        `Deploy ${app} to PRODUCTION? This affects live users.`,
        { dangerous: true },
      );
      if (!confirmed) {
        await this.record({
          id: crypto.randomUUID(),
          app,
          environment,
          status: 'cancelled',
          startedAt,
          completedAt: new Date().toISOString(),
          steps,
        });
        return { status: 'cancelled', environment, steps };
      }
      steps.push('Production deploy confirmed');
      yield { checkpoint: true, state: { step: 4, environment } };
    }

    yield io.emit.progress(0.7, `Deploying to ${environment}...`);
    await this.sleep(2000);
    steps.push(`Deployed to ${environment}`);
    yield { checkpoint: true, state: { step: 5, environment } };

    yield io.emit.progress(0.9, 'Running health checks...');
    await this.sleep(1000);
    steps.push('Health checks passed');

    yield io.emit.progress(1.0, 'Deploy complete!');
    yield io.emit.toast(`${app} deployed to ${environment}`, 'success');

    this.emit({ channel: 'deploys', event: 'completed', data: { app, environment } });

    await this.record({
      id: crypto.randomUUID(),
      app,
      environment,
      status: 'success',
      startedAt,
      completedAt: new Date().toISOString(),
      steps,
    });

    return { status: 'success', environment, steps };
  }

  /**
   * Show last deployment status
   * @autorun
   * @icon ℹ️
   */
  async status() {
    const history = await this.memory.get<DeployRecord[]>('history') ?? [];
    return history.length === 0 ? { status: 'No deployments recorded' } : history[history.length - 1];
  }

  /**
   * Deployment history
   * @param limit Recent deploys to show {@default 10}
   * @format table
   * @icon 📋
   */
  async history(params?: { limit?: number }) {
    const history = await this.memory.get<DeployRecord[]>('history') ?? [];
    const recent = history.slice(-(params?.limit ?? 10)).reverse();

    return new Table(recent)
      .text('app')
      .badge('environment', { colors: { staging: 'blue', production: 'red' } })
      .badge('status', { colors: { success: 'green', failed: 'red', cancelled: 'gray' } })
      .datetime('completedAt');
  }

  private async record(r: DeployRecord): Promise<void> {
    await this.memory.update<DeployRecord[]>('history', h => [...(h ?? []), r]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
