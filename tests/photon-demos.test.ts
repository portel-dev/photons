/**
 * Tests for demo photons: tasks-live, expenses, deploy, team-pulse
 *
 * Tests photon methods via executeTool() which sets up executionContext.
 * Uses temp directories for memory isolation via PHOTON_DATA_DIR.
 */

import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Redirect memory storage to temp dir BEFORE importing photons
const testDataDir = path.join(os.tmpdir(), `photon-demo-test-${Date.now()}`);
process.env.PHOTON_DATA_DIR = testDataDir;

// Import photons
import TasksLive from '../tasks-live.photon.js';
import Expenses from '../expenses.photon.js';
import Deploy from '../deploy.photon.js';
import TeamPulse from '../team-pulse.photon.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

/** Run a photon method capturing emitted events */
async function exec(photon: any, method: string, params?: any): Promise<{ result: any; events: any[] }> {
  const events: any[] = [];
  const result = await photon.executeTool(method, params, {
    outputHandler: (data: any) => events.push(data),
  });
  return { result, events };
}

// ════════════════════════════════════════════════════════════════════════════════
// TASKS-LIVE
// ════════════════════════════════════════════════════════════════════════════════

async function testTasksLive() {
  console.log('\n📋 tasks-live — Memory-backed persistence\n');

  const photon = new TasksLive();
  (photon as any)._photonName = 'tasks-live-test';

  await test('list returns empty initially', async () => {
    const { result } = await exec(photon, 'list');
    assert.deepEqual(result, []);
  });

  await test('add creates a task and persists', async () => {
    const { result } = await exec(photon, 'add', { text: 'Buy milk' });
    assert.equal(result.added, 'Buy milk');
    assert.equal(result.total, 1);
  });

  await test('add emits toast', async () => {
    const { events } = await exec(photon, 'add', { text: 'Walk dog' });
    const toast = events.find(e => e.emit === 'toast');
    assert.ok(toast, 'should emit toast');
    assert.ok(toast.message.includes('Walk dog'));
    assert.equal(toast.type, 'success');
  });

  await test('list returns all tasks with status', async () => {
    const { result } = await exec(photon, 'list');
    assert.equal(result.length, 2);
    assert.equal(result[0].status, 'pending');
    assert.equal(result[0].text, 'Buy milk');
  });

  await test('complete marks task as done', async () => {
    const { result } = await exec(photon, 'complete', { index: 1 });
    assert.equal(result.completed, 'Buy milk');
  });

  await test('complete shows done status in list', async () => {
    const { result } = await exec(photon, 'list');
    assert.equal(result[0].status, '✓ done');
    assert.equal(result[1].status, 'pending');
  });

  await test('complete returns error for invalid index', async () => {
    const { result } = await exec(photon, 'complete', { index: 99 });
    assert.equal(result.error, 'Task not found');
  });

  await test('clean removes completed tasks', async () => {
    const { result } = await exec(photon, 'clean');
    assert.equal(result.removed, 1);
    assert.equal(result.remaining, 1);
  });

  await test('data survives new instance (persistence)', async () => {
    const photon2 = new TasksLive();
    (photon2 as any)._photonName = 'tasks-live-test';
    const { result } = await exec(photon2, 'list');
    assert.equal(result.length, 1);
    assert.equal(result[0].text, 'Walk dog');
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPENSES
// ════════════════════════════════════════════════════════════════════════════════

async function testExpenses() {
  console.log('\n💰 expenses — Memory + Collection + Table\n');

  const photon = new Expenses();
  (photon as any)._photonName = 'expenses-test';

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  await test('add creates an expense', async () => {
    const { result } = await exec(photon, 'add', { amount: 42.50, category: 'food', description: 'Lunch', date: today });
    assert.equal(result.added.amount, 42.50);
    assert.equal(result.added.category, 'food');
    assert.equal(result.total, 1);
  });

  await test('add emits toast', async () => {
    const { events } = await exec(photon, 'add', { amount: 15.00, category: 'transport', description: 'Bus', date: today });
    const toast = events.find(e => e.emit === 'toast' && e.type === 'success');
    assert.ok(toast, 'should emit success toast');
  });

  await test('add more expenses for variety', async () => {
    await exec(photon, 'add', { amount: 120, category: 'utilities', description: 'Electric bill', date: today });
    await exec(photon, 'add', { amount: 8.99, category: 'food', description: 'Coffee', date: today });
    await exec(photon, 'add', { amount: 55, category: 'entertainment', description: 'Movie tickets', date: today });
  });

  await test('list returns Table with all expenses', async () => {
    const { result } = await exec(photon, 'list');
    const json = result.toJSON();
    assert.equal(json._photonType, 'table');
    assert.equal(json.rows.length, 5);
  });

  await test('list filters by category', async () => {
    const { result } = await exec(photon, 'list', { category: 'food' });
    const json = result.toJSON();
    assert.equal(json.rows.length, 2);
  });

  await test('list filters by month', async () => {
    const { result } = await exec(photon, 'list', { month });
    const json = result.toJSON();
    assert.equal(json.rows.length, 5);
  });

  await test('summary shows category breakdown', async () => {
    const { result } = await exec(photon, 'summary', { month });
    assert.equal(result.month, month);
    assert.equal(result.grandTotal, 42.50 + 15 + 120 + 8.99 + 55);
    const breakdown = result.breakdown.toJSON();
    assert.ok(breakdown.rows.length >= 3, 'should have at least 3 categories');
    // First should be utilities (highest total = 120)
    assert.equal(breakdown.rows[0].category, 'utilities');
  });

  await test('budget set', async () => {
    const { result } = await exec(photon, 'budget', { limit: 300 });
    assert.equal(result.status, 'set');
    assert.equal(result.budget, 300);
  });

  await test('budget check shows spending', async () => {
    const { result } = await exec(photon, 'budget');
    assert.equal(result.budget, 300);
    assert.equal(result.spent, 42.50 + 15 + 120 + 8.99 + 55);
    assert.ok(result.remaining < 300);
    assert.equal(result.status, 'on track');
  });

  await test('budget warns when over limit', async () => {
    await exec(photon, 'budget', { limit: 100 });
    const { events } = await exec(photon, 'add', { amount: 5, category: 'food', description: 'Snack', date: today });
    const warning = events.find(e => e.emit === 'toast' && e.type === 'warning');
    assert.ok(warning, 'should emit budget warning toast');
    assert.ok(warning.message.includes('Over budget'));
  });

  await test('data persists across instances', async () => {
    const photon2 = new Expenses();
    (photon2 as any)._photonName = 'expenses-test';
    const { result } = await exec(photon2, 'list');
    assert.equal(result.toJSON().rows.length, 6);
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// DEPLOY
// ════════════════════════════════════════════════════════════════════════════════

async function testDeploy() {
  console.log('\n🚀 deploy — Stateful workflow + Table\n');

  const photon = new Deploy();
  (photon as any)._photonName = 'deploy-test';

  await test('status returns no-deployments initially', async () => {
    const { result } = await exec(photon, 'status');
    assert.ok(result.status.includes('No deployments'));
  });

  await test('history returns empty Table initially', async () => {
    const { result } = await exec(photon, 'history');
    const json = result.toJSON();
    assert.equal(json.rows.length, 0);
  });

  // Test the generator directly (executeTool doesn't handle generators — we step manually)
  await test('run generator yields select, progress, and checkpoint', async () => {
    const gen = (photon as any).run({ app: 'test-app' });

    // Status emit
    let step = await gen.next();
    assert.equal(step.value.emit, 'status');

    // Ask select for environment
    step = await gen.next();
    assert.equal(step.value.ask, 'select');
    assert.ok(step.value.message.includes('environment'));

    // Answer: staging
    step = await gen.next('staging');
    assert.ok(step.value.checkpoint === true);

    // Walk through remaining yields
    let checkpoints = 1;
    let progresses = 0;
    while (!step.done) {
      step = await gen.next();
      if (step.done) break;
      if (step.value?.checkpoint) checkpoints++;
      if (step.value?.emit === 'progress') progresses++;
    }

    assert.ok(checkpoints >= 3, `should have at least 3 checkpoints, got ${checkpoints}`);
    assert.ok(progresses >= 3, `should have at least 3 progress events, got ${progresses}`);
    assert.equal(step.value.status, 'success');
    assert.equal(step.value.environment, 'staging');
    assert.ok(step.value.steps.length > 0);
  });

  await test('status shows last deploy after run', async () => {
    const { result } = await exec(photon, 'status');
    assert.equal(result.status, 'success');
    assert.equal(result.app, 'test-app');
    assert.equal(result.environment, 'staging');
  });

  await test('history shows deploy record', async () => {
    const { result } = await exec(photon, 'history');
    const json = result.toJSON();
    assert.equal(json.rows.length, 1);
    assert.equal(json.rows[0].app, 'test-app');
    assert.equal(json.rows[0].status, 'success');
  });

  // Test production with cancel
  await test('run with production cancel records cancelled', async () => {
    const gen = (photon as any).run({ app: 'prod-app' });

    // Status
    await gen.next();
    // Select env
    await gen.next();
    // Choose production
    let step = await gen.next('production');

    // Walk through until confirm ask
    while (!step.done && step.value?.ask !== 'confirm') {
      step = await gen.next();
    }

    assert.equal(step.value.ask, 'confirm');
    assert.ok(step.value.dangerous);

    // Decline
    step = await gen.next(false);
    assert.ok(step.done);
    assert.equal(step.value.status, 'cancelled');
  });

  await test('history shows both deploys', async () => {
    const { result } = await exec(photon, 'history');
    const json = result.toJSON();
    assert.equal(json.rows.length, 2);
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// TEAM-PULSE
// ════════════════════════════════════════════════════════════════════════════════

async function testTeamPulse() {
  console.log('\n📡 team-pulse — Memory + Collection + Locking\n');

  const photon = new TeamPulse();
  (photon as any)._photonName = 'team-pulse-test';

  // Override withLock to skip daemon dependency
  (photon as any).withLock = async (_name: string, fn: () => Promise<any>) => fn();

  await test('today returns empty message initially', async () => {
    const { result } = await exec(photon, 'today');
    assert.ok(result.message.includes('No updates'));
  });

  await test('post saves an update', async () => {
    const { result } = await exec(photon, 'post', { name: 'Alice', update: 'Implemented auth flow', blockers: 'Waiting on API keys' });
    assert.equal(result.posted.name, 'Alice');
    assert.equal(result.posted.update, 'Implemented auth flow');
    assert.equal(result.posted.blockers, 'Waiting on API keys');
  });

  await test('post emits toast and channel event', async () => {
    const { events } = await exec(photon, 'post', { name: 'Bob', update: 'Fixed deployment script' });
    const toast = events.find(e => e.emit === 'toast');
    assert.ok(toast, 'should emit toast');
    const channel = events.find(e => e.channel === 'pulse');
    assert.ok(channel, 'should emit to pulse channel');
    assert.equal(channel.event, 'new-update');
  });

  await test('post without blockers sets null', async () => {
    const { result } = await exec(photon, 'post', { name: 'Carol', update: 'Code review' });
    assert.equal(result.posted.blockers, null);
  });

  await test('today shows all updates newest-first', async () => {
    const { result } = await exec(photon, 'today');
    assert.ok(Array.isArray(result), 'should be array');
    assert.equal(result.length, 3);
    // Sorted by seq desc — newest first
    assert.equal(result[0].name, 'Carol');
    assert.equal(result[1].name, 'Bob');
    assert.equal(result[2].name, 'Alice');
    assert.equal(result[2].blockers, 'Waiting on API keys');
  });

  await test('history returns grouped data', async () => {
    const { result } = await exec(photon, 'history', { days: 7 });
    assert.equal(result.totalUpdates, 3);
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(result.updates[today], `should have today's date (${today})`);
    assert.equal(result.updates[today].length, 3);
  });

  await test('search finds matching updates', async () => {
    const { result } = await exec(photon, 'search', { query: 'auth' });
    const json = result.toJSON();
    assert.equal(json.rows.length, 1);
    assert.equal(json.rows[0].name, 'Alice');
  });

  await test('search finds by name', async () => {
    const { result } = await exec(photon, 'search', { query: 'bob' });
    const json = result.toJSON();
    assert.equal(json.rows.length, 1);
  });

  await test('search finds by blocker', async () => {
    const { result } = await exec(photon, 'search', { query: 'API keys' });
    const json = result.toJSON();
    assert.equal(json.rows.length, 1);
    assert.equal(json.rows[0].name, 'Alice');
  });

  await test('data persists across instances', async () => {
    const photon2 = new TeamPulse();
    (photon2 as any)._photonName = 'team-pulse-test';
    (photon2 as any).withLock = async (_name: string, fn: () => Promise<any>) => fn();
    const { result } = await exec(photon2, 'today');
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 3);
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// RUN ALL
// ════════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log('Demo Photon Tests\n' + '='.repeat(55));

  await testTasksLive();
  await testExpenses();
  await testDeploy();
  await testTeamPulse();

  // Cleanup temp dir
  fs.rmSync(testDataDir, { recursive: true, force: true });
  delete process.env.PHOTON_DATA_DIR;

  console.log('\n' + '='.repeat(55));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
  console.log('\nAll demo photon tests passed!');
})();
