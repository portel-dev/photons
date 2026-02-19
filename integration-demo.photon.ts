/**
 * Integration Demo — Dependencies, Assets, Stateful Workflows
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags demo, integration, stateful, assets, resources
 * @icon 🔗
 * @stateful
 * @runtime >=1.0.0
 * @cli node - https://nodejs.org
 * @ui result-viewer ./ui/result-viewer.html
 */

import { PhotonMCP, io } from '@portel/photon-core';
import * as os from 'os';

interface WorkflowStep {
  name: string;
  status: 'pending' | 'running' | 'complete';
  result?: any;
}

export default class IntegrationDemoPhoton extends PhotonMCP {

  /**
   * Show photon info, runtime version, and dependency status
   * @ui result-viewer
   * @format json
   */
  async info(): Promise<{
    photonName: string;
    photonVersion: string;
    runtime: string;
    runtimeConstraint: string;
    platform: string;
    nodeVersion: string;
    cliDependencies: Array<{ name: string; status: string }>;
    annotations: string[];
  }> {
    return {
      photonName: 'integration-demo',
      photonVersion: '1.0.0',
      runtime: 'photon',
      runtimeConstraint: '>=1.0.0',
      platform: `${os.platform()} ${os.arch()}`,
      nodeVersion: process.version,
      cliDependencies: [
        { name: 'node', status: 'available' },
      ],
      annotations: [
        'runtime: >=1.0.0',
        'cli: node',
        'stateful: true',
        'ui: result-viewer',
      ],
    };
  }

  /**
   * Multi-step stateful workflow with checkpoint yields
   * @stateful
   * @param steps Number of processing steps {@min 2} {@max 10} {@default 3}
   * @ui result-viewer
   */
  async *workflow(params: {
    input: string;
    steps?: number;
  }): AsyncGenerator<any, { steps: WorkflowStep[]; finalResult: string }> {
    const totalSteps = params.steps || 3;
    const completedSteps: WorkflowStep[] = [];

    yield io.emit.status(`Starting ${totalSteps}-step workflow...`);

    for (let i = 1; i <= totalSteps; i++) {
      const stepName = `Step ${i}: ${i === 1 ? 'Validate' : i === totalSteps ? 'Finalize' : `Process-${i}`}`;

      yield io.emit.progress(i / totalSteps, stepName);
      yield io.emit.log(`Executing ${stepName}`, 'info');

      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 100));

      const step: WorkflowStep = {
        name: stepName,
        status: 'complete',
        result: `Processed "${params.input}" at step ${i}`,
      };
      completedSteps.push(step);

      // Checkpoint after each step for resumability
      yield { checkpoint: true, state: { completedSteps: completedSteps.length, lastStep: stepName } };
    }

    yield io.emit.status('Workflow complete!');
    yield io.emit.toast('Workflow finished successfully', 'success');

    return {
      steps: completedSteps,
      finalResult: `Processed "${params.input}" through ${totalSteps} steps`,
    };
  }

  /**
   * Integration demo status resource
   * @Static photon://integration-demo/status
   */
  async status(): Promise<{
    name: string;
    version: string;
    uptime: number;
    features: string[];
  }> {
    return {
      name: 'integration-demo',
      version: '1.0.0',
      uptime: process.uptime(),
      features: [
        'runtime-constraint',
        'cli-dependency',
        'stateful-workflows',
        'checkpoint-resume',
        'ui-assets',
        'mcp-resources',
      ],
    };
  }

  /**
   * List discovered assets for this photon
   * @format json
   */
  async assets(): Promise<{
    assetFolder: string;
    uiAssets: string[];
    annotations: string[];
  }> {
    return {
      assetFolder: 'integration-demo/',
      uiAssets: ['ui/result-viewer.html'],
      annotations: ['ui: result-viewer ./ui/result-viewer.html'],
    };
  }

  /**
   * Render platform details as a markdown report
   * @format markdown
   */
  async report(): Promise<string> {
    return `# Integration Demo Report

## Environment
- **Platform**: ${os.platform()} ${os.arch()}
- **Node**: ${process.version}
- **Uptime**: ${Math.floor(process.uptime())}s

## Features Demonstrated
1. Runtime version constraint (>=1.0.0)
2. CLI dependency check (node)
3. Stateful workflows with checkpoints
4. UI asset linking (result-viewer)
5. MCP resource method (Static)
6. Asset folder discovery

## Status
All integration features operational.
`;
  }

  /**
   * Verify info returns valid structure
   * @internal
   */
  async testVersionInfo(): Promise<{ passed: boolean; message: string }> {
    const result = await this.info();

    if (result.photonName !== 'integration-demo') {
      return { passed: false, message: `Expected photonName=integration-demo, got ${result.photonName}` };
    }
    if (result.photonVersion !== '1.0.0') {
      return { passed: false, message: `Expected version=1.0.0, got ${result.photonVersion}` };
    }
    if (result.runtimeConstraint !== '>=1.0.0') {
      return { passed: false, message: `Expected constraint >=1.0.0, got ${result.runtimeConstraint}` };
    }
    if (!result.platform) {
      return { passed: false, message: 'Missing platform info' };
    }
    if (!result.nodeVersion.startsWith('v')) {
      return { passed: false, message: `Node version should start with v, got ${result.nodeVersion}` };
    }
    if (!Array.isArray(result.cliDependencies) || result.cliDependencies.length === 0) {
      return { passed: false, message: 'Should have cli dependencies listed' };
    }
    if (!Array.isArray(result.annotations) || result.annotations.length === 0) {
      return { passed: false, message: 'Should have annotations listed' };
    }

    return { passed: true, message: 'Info returns complete structure with version, platform, and dependencies' };
  }

  /**
   * Verify workflow generator yields checkpoints and completes
   * @internal
   */
  async testWorkflowSteps(): Promise<{ passed: boolean; message: string }> {
    const gen = this.workflow({ input: 'test-data', steps: 3 });
    const yields: any[] = [];

    let result = await gen.next();
    while (!result.done) {
      yields.push(result.value);
      result = await gen.next();
    }

    // Check we got checkpoints
    const checkpoints = yields.filter(y => y && y.checkpoint === true);
    if (checkpoints.length !== 3) {
      return { passed: false, message: `Expected 3 checkpoints, got ${checkpoints.length}` };
    }

    // Check we got progress emissions
    const progress = yields.filter(y => y && y.emit === 'progress');
    if (progress.length < 3) {
      return { passed: false, message: `Expected at least 3 progress yields, got ${progress.length}` };
    }

    // Check final return value
    const finalValue = result.value;
    if (!finalValue.steps || finalValue.steps.length !== 3) {
      return { passed: false, message: `Expected 3 completed steps, got ${finalValue.steps?.length}` };
    }
    if (!finalValue.finalResult.includes('test-data')) {
      return { passed: false, message: 'Final result should contain input data' };
    }

    // Check each step is marked complete
    for (const step of finalValue.steps) {
      if (step.status !== 'complete') {
        return { passed: false, message: `Step "${step.name}" should be complete, got ${step.status}` };
      }
    }

    return { passed: true, message: 'Workflow yields 3 checkpoints, progress updates, and returns completed steps' };
  }

  /**
   * Verify asset folder structure
   * @internal
   */
  async testAssetDiscovery(): Promise<{ passed: boolean; message: string }> {
    const result = await this.assets();

    if (result.assetFolder !== 'integration-demo/') {
      return { passed: false, message: `Expected folder integration-demo/, got ${result.assetFolder}` };
    }
    if (!result.uiAssets.includes('ui/result-viewer.html')) {
      return { passed: false, message: 'Should include ui/result-viewer.html in assets' };
    }
    if (result.annotations.length === 0) {
      return { passed: false, message: 'Should have ui annotations' };
    }

    return { passed: true, message: 'Asset discovery returns correct folder structure and UI assets' };
  }

  /**
   * Verify resource method returns valid data
   * @internal
   */
  async testResourceMethod(): Promise<{ passed: boolean; message: string }> {
    const result = await this.status();

    if (result.name !== 'integration-demo') {
      return { passed: false, message: `Expected name=integration-demo, got ${result.name}` };
    }
    if (typeof result.uptime !== 'number') {
      return { passed: false, message: 'uptime should be a number' };
    }
    if (!Array.isArray(result.features) || result.features.length < 4) {
      return { passed: false, message: `Expected at least 4 features, got ${result.features?.length}` };
    }

    return { passed: true, message: 'Resource method returns structured status with features list' };
  }

  /**
   * Verify report returns markdown
   * @internal
   */
  async testMarkdownReport(): Promise<{ passed: boolean; message: string }> {
    const result = await this.report();

    if (!result.includes('# Integration Demo Report')) {
      return { passed: false, message: 'Report should have markdown heading' };
    }
    if (!result.includes('Platform')) {
      return { passed: false, message: 'Report should include platform info' };
    }
    if (!result.includes('Stateful workflows')) {
      return { passed: false, message: 'Report should mention stateful workflows' };
    }

    return { passed: true, message: 'Markdown report contains heading, platform, and feature list' };
  }
}
