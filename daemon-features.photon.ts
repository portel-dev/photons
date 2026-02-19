/**
 * Daemon Features - Scheduled Jobs, Webhooks, Locks, Pub/Sub
 *
 * @version 1.0.0
 * @author Portel
 * @license MIT
 * @tags demo, daemon, scheduled, webhook, locks, pubsub
 * @icon 🔧
 */

import { PhotonMCP } from '@portel/photon-core';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { existsSync, mkdirSync } from 'fs';

const STATE_DIR = path.join(
  process.env.PHOTONS_DIR || path.join(os.homedir(), '.photon'),
  'daemon-features'
);
const HEARTBEAT_PATH = path.join(STATE_DIR, 'heartbeat.json');

interface HeartbeatState {
  lastRun: string;
  runCount: number;
  history: string[];
}

export default class DaemonFeaturesPhoton extends PhotonMCP {
  private _ensureDir(): void {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  private async _loadHeartbeat(): Promise<HeartbeatState> {
    try {
      if (existsSync(HEARTBEAT_PATH)) {
        const raw = await fs.readFile(HEARTBEAT_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {}
    return { lastRun: '', runCount: 0, history: [] };
  }

  private async _saveHeartbeat(state: HeartbeatState): Promise<void> {
    this._ensureDir();
    await fs.writeFile(HEARTBEAT_PATH, JSON.stringify(state, null, 2));
  }

  /**
   * Heartbeat - writes timestamp to state file every minute
   * @scheduled * * * * *
   * @internal
   */
  async scheduledHeartbeat(): Promise<{ ran: boolean; runCount: number }> {
    const state = await this._loadHeartbeat();
    const now = new Date().toISOString();

    state.lastRun = now;
    state.runCount++;
    state.history.push(now);

    // Keep only last 60 entries
    if (state.history.length > 60) {
      state.history = state.history.slice(-60);
    }

    await this._saveHeartbeat(state);

    this.emit({
      channel: 'daemon-features:heartbeat',
      event: 'tick',
      data: { timestamp: now, runCount: state.runCount },
    });

    return { ran: true, runCount: state.runCount };
  }

  /**
   * Receive a webhook payload and echo it back with metadata
   * @internal
   */
  async handleWebhook(params: {
    payload: Record<string, any>;
    source?: string;
  }): Promise<{
    received: boolean;
    echo: Record<string, any>;
    source: string;
    receivedAt: string;
  }> {
    const receivedAt = new Date().toISOString();

    this.emit({
      channel: 'daemon-features:webhooks',
      event: 'received',
      data: { source: params.source || 'unknown', receivedAt },
    });

    return {
      received: true,
      echo: params.payload,
      source: params.source || 'unknown',
      receivedAt,
    };
  }

  /**
   * Critical operation with distributed lock
   * @locked daemon-features:critical
   */
  async critical(params: { operation: string }): Promise<{
    operation: string;
    completed: boolean;
    lockedBy: string;
  }> {
    // Simulate a critical section
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      operation: params.operation,
      completed: true,
      lockedBy: 'daemon-features:critical',
    };
  }

  /**
   * Manual distributed locking with this.withLock()
   */
  async protect(params: {
    resource: string;
    value: number;
  }): Promise<{ resource: string; result: number; locked: boolean }> {
    // withLock is available when running in daemon/MCP mode.
    // In direct mode, fall back to executing without a lock.
    const compute = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return params.value * 2;
    };

    let result: number;
    let locked = false;

    if (typeof this.withLock === 'function') {
      result = await this.withLock(`daemon-features:${params.resource}`, compute);
      locked = true;
    } else {
      result = await compute();
    }

    return {
      resource: params.resource,
      result,
      locked,
    };
  }

  /**
   * Publish a message to a named channel
   */
  async publish(params: {
    channel: string;
    message: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<{ published: boolean; channel: string; priority: string }> {
    const priority = params.priority || 'normal';

    this.emit({
      channel: `daemon-features:${params.channel}`,
      event: 'message',
      data: {
        message: params.message,
        priority,
        timestamp: new Date().toISOString(),
      },
    });

    // Also emit a toast for UI feedback
    this.emit({
      emit: 'toast',
      message: `Published to ${params.channel}`,
    });

    return {
      published: true,
      channel: `daemon-features:${params.channel}`,
      priority,
    };
  }

  /**
   * Show daemon feature status
   * @format json
   */
  async status(): Promise<{
    heartbeat: HeartbeatState;
    stateDir: string;
    stateFileExists: boolean;
  }> {
    const heartbeat = await this._loadHeartbeat();

    return {
      heartbeat,
      stateDir: STATE_DIR,
      stateFileExists: existsSync(HEARTBEAT_PATH),
    };
  }

  /**
   * Verify webhook echo returns correct structure
   * @internal
   */
  async testWebhookEcho(): Promise<{ passed: boolean; message: string }> {
    const payload = { event: 'test', data: { id: 123 } };
    const result = await this.handleWebhook({ payload, source: 'test-runner' });

    if (!result.received) {
      return { passed: false, message: 'Webhook should return received=true' };
    }
    if (result.echo.event !== 'test' || result.echo.data.id !== 123) {
      return { passed: false, message: 'Webhook echo does not match input payload' };
    }
    if (result.source !== 'test-runner') {
      return { passed: false, message: `Expected source=test-runner, got ${result.source}` };
    }
    if (!result.receivedAt) {
      return { passed: false, message: 'Missing receivedAt timestamp' };
    }

    return { passed: true, message: 'Webhook echoes payload with metadata correctly' };
  }

  /**
   * Verify manual lock executes and returns result
   * @internal
   */
  async testManualLock(): Promise<{ passed: boolean; message: string }> {
    const result = await this.protect({ resource: 'test', value: 21 });

    if (result.result !== 42) {
      return { passed: false, message: `Expected result=42, got ${result.result}` };
    }
    if (result.resource !== 'test') {
      return { passed: false, message: `Expected resource=test, got ${result.resource}` };
    }
    // locked=true only in daemon mode; in direct mode it's false (graceful fallback)

    return { passed: true, message: `withLock computation correct (locked=${result.locked})` };
  }

  /**
   * Verify publish returns confirmation
   * @internal
   */
  async testPublish(): Promise<{ passed: boolean; message: string }> {
    const result = await this.publish({
      channel: 'test-channel',
      message: 'test message',
      priority: 'high',
    });

    if (!result.published) {
      return { passed: false, message: 'Expected published=true' };
    }
    if (result.channel !== 'daemon-features:test-channel') {
      return { passed: false, message: `Expected channel=daemon-features:test-channel, got ${result.channel}` };
    }
    if (result.priority !== 'high') {
      return { passed: false, message: `Expected priority=high, got ${result.priority}` };
    }

    return { passed: true, message: 'Publish returns confirmation with namespaced channel' };
  }

  /**
   * Verify status method returns valid structure
   * @internal
   */
  async testStatusReads(): Promise<{ passed: boolean; message: string }> {
    const result = await this.status();

    if (!result.heartbeat || typeof result.heartbeat !== 'object') {
      return { passed: false, message: 'Status should return heartbeat object' };
    }
    if (typeof result.heartbeat.runCount !== 'number') {
      return { passed: false, message: 'heartbeat.runCount should be a number' };
    }
    if (!Array.isArray(result.heartbeat.history)) {
      return { passed: false, message: 'heartbeat.history should be an array' };
    }
    if (typeof result.stateDir !== 'string') {
      return { passed: false, message: 'stateDir should be a string' };
    }
    if (typeof result.stateFileExists !== 'boolean') {
      return { passed: false, message: 'stateFileExists should be a boolean' };
    }

    return { passed: true, message: 'Status returns complete heartbeat state structure' };
  }

  /**
   * Verify critical (locked) method executes
   * @internal
   */
  async testCriticalLocked(): Promise<{ passed: boolean; message: string }> {
    const result = await this.critical({ operation: 'test-op' });

    if (!result.completed) {
      return { passed: false, message: 'Critical operation should complete' };
    }
    if (result.operation !== 'test-op') {
      return { passed: false, message: `Expected operation=test-op, got ${result.operation}` };
    }
    if (result.lockedBy !== 'daemon-features:critical') {
      return { passed: false, message: `Expected lockedBy=daemon-features:critical, got ${result.lockedBy}` };
    }

    return { passed: true, message: 'Locked method executes and returns correct lock identifier' };
  }

  /**
   * Verify scheduled heartbeat writes state
   * @internal
   */
  async testScheduledHeartbeat(): Promise<{ passed: boolean; message: string }> {
    // Run the heartbeat manually
    const before = await this._loadHeartbeat();
    const beforeCount = before.runCount;

    const result = await this.scheduledHeartbeat();

    if (!result.ran) {
      return { passed: false, message: 'Heartbeat should return ran=true' };
    }
    if (result.runCount !== beforeCount + 1) {
      return { passed: false, message: `Expected runCount=${beforeCount + 1}, got ${result.runCount}` };
    }

    // Verify state file was written
    const after = await this._loadHeartbeat();
    if (!after.lastRun) {
      return { passed: false, message: 'State file should have lastRun timestamp' };
    }
    if (after.runCount !== beforeCount + 1) {
      return { passed: false, message: 'State file runCount should match' };
    }

    return { passed: true, message: 'Scheduled heartbeat writes state file with timestamp and incremented count' };
  }
}
