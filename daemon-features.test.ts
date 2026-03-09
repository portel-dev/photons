/**
 * External tests for daemon-features.photon.ts
 *
 * Run with: photon test daemon-features
 */

export async function testWebhookEcho(photon: any): Promise<{ passed: boolean; message: string }> {
  const payload = { event: 'test', data: { id: 123 } };
  const result = await photon.handleWebhook({ payload, source: 'test-runner' });

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

export async function testManualLock(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.protect({ resource: 'test', value: 21 });

  if (result.result !== 42) {
    return { passed: false, message: `Expected result=42, got ${result.result}` };
  }
  if (result.resource !== 'test') {
    return { passed: false, message: `Expected resource=test, got ${result.resource}` };
  }
  // locked=true only in daemon mode; in direct mode it's false (graceful fallback)

  return { passed: true, message: `withLock computation correct (locked=${result.locked})` };
}

export async function testPublish(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.publish({
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

export async function testStatusReads(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.status();

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

export async function testCriticalLocked(photon: any): Promise<{ passed: boolean; message: string }> {
  const result = await photon.critical({ operation: 'test-op' });

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

export async function testScheduledHeartbeat(photon: any): Promise<{ passed: boolean; message: string }> {
  // Load heartbeat state before running
  const before = await (photon as any)._loadHeartbeat();
  const beforeCount = before.runCount;

  const result = await photon.scheduledHeartbeat();

  if (!result.ran) {
    return { passed: false, message: 'Heartbeat should return ran=true' };
  }
  if (result.runCount !== beforeCount + 1) {
    return { passed: false, message: `Expected runCount=${beforeCount + 1}, got ${result.runCount}` };
  }

  // Verify state file was written
  const after = await (photon as any)._loadHeartbeat();
  if (!after.lastRun) {
    return { passed: false, message: 'State file should have lastRun timestamp' };
  }
  if (after.runCount !== beforeCount + 1) {
    return { passed: false, message: 'State file runCount should match' };
  }

  return { passed: true, message: 'Scheduled heartbeat writes state file with timestamp and incremented count' };
}
