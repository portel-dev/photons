// Tests for daemon-features.photon.ts

export async function testWebhookEcho(photon: any) {
  const payload = { event: 'test', data: { id: 123 } };
  const result = await photon.handleWebhook({ payload, source: 'test-runner' });

  if (!result.received) {
    throw new Error('Webhook should return received=true');
  }
  if (result.echo.event !== 'test' || result.echo.data.id !== 123) {
    throw new Error('Webhook echo does not match input payload');
  }
  if (result.source !== 'test-runner') {
    throw new Error(`Expected source=test-runner, got ${result.source}`);
  }
  if (!result.receivedAt) {
    throw new Error('Missing receivedAt timestamp');
  }
}

export async function testManualLock(photon: any) {
  const result = await photon.protect({ resource: 'test', value: 21 });

  if (result.result !== 42) {
    throw new Error(`Expected result=42, got ${result.result}`);
  }
  if (result.resource !== 'test') {
    throw new Error(`Expected resource=test, got ${result.resource}`);
  }
}

export async function testPublish(photon: any) {
  const result = await photon.publish({
    channel: 'test-channel',
    message: 'test message',
    priority: 'high',
  });

  if (!result.published) {
    throw new Error('Expected published=true');
  }
  if (result.channel !== 'daemon-features:test-channel') {
    throw new Error(`Expected channel=daemon-features:test-channel, got ${result.channel}`);
  }
  if (result.priority !== 'high') {
    throw new Error(`Expected priority=high, got ${result.priority}`);
  }
}

export async function testStatusReads(photon: any) {
  const result = await photon.status();

  if (!result.heartbeat || typeof result.heartbeat !== 'object') {
    throw new Error('Status should return heartbeat object');
  }
  if (typeof result.heartbeat.runCount !== 'number') {
    throw new Error('heartbeat.runCount should be a number');
  }
  if (!Array.isArray(result.heartbeat.history)) {
    throw new Error('heartbeat.history should be an array');
  }
  if (typeof result.stateDir !== 'string') {
    throw new Error('stateDir should be a string');
  }
  if (typeof result.stateFileExists !== 'boolean') {
    throw new Error('stateFileExists should be a boolean');
  }
}

export async function testCriticalLocked(photon: any) {
  const result = await photon.critical({ operation: 'test-op' });

  if (!result.completed) {
    throw new Error('Critical operation should complete');
  }
  if (result.operation !== 'test-op') {
    throw new Error(`Expected operation=test-op, got ${result.operation}`);
  }
  if (result.lockedBy !== 'daemon-features:critical') {
    throw new Error(`Expected lockedBy=daemon-features:critical, got ${result.lockedBy}`);
  }
}

export async function testScheduledHeartbeat(photon: any) {
  const before = await (photon as any)._loadHeartbeat();
  const beforeCount = before.runCount;

  const result = await photon.scheduledHeartbeat();

  if (!result.ran) {
    throw new Error('Heartbeat should return ran=true');
  }
  if (result.runCount !== beforeCount + 1) {
    throw new Error(`Expected runCount=${beforeCount + 1}, got ${result.runCount}`);
  }

  const after = await (photon as any)._loadHeartbeat();
  if (!after.lastRun) {
    throw new Error('State file should have lastRun timestamp');
  }
  if (after.runCount !== beforeCount + 1) {
    throw new Error('State file runCount should match');
  }
}
