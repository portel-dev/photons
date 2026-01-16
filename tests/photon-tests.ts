/**
 * Photon Test Suite
 *
 * Reusable tests for all photons in the official repository.
 * Run with: npx tsx tests/photon-tests.ts
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const PHOTONS_DIR = path.join(os.homedir(), 'Projects/photons');
const PHOTON_CLI = path.join(os.homedir(), 'Projects/photon/src/cli.ts');

interface TestResult {
  photon: string;
  method: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runPhotonMethod(
  photon: string,
  method: string,
  args: string[] = []
): Promise<{ success: boolean; result?: any; error?: string }> {
  return new Promise((resolve) => {
    const cmdArgs = ['tsx', PHOTON_CLI, 'cli', '--dir', PHOTONS_DIR, photon, method, ...args, '--json'];

    const proc = spawn('npx', cmdArgs, {
      cwd: PHOTONS_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve({ success: true, result });
        } catch {
          resolve({ success: true, result: stdout.trim() });
        }
      } else {
        resolve({ success: false, error: stderr || stdout });
      }
    });

    proc.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    // Timeout after 30s
    setTimeout(() => {
      proc.kill();
      resolve({ success: false, error: 'Timeout' });
    }, 30000);
  });
}

async function test(
  photon: string,
  method: string,
  args: string[] = [],
  validate?: (result: any) => boolean
): Promise<boolean> {
  const start = Date.now();
  const { success, result, error } = await runPhotonMethod(photon, method, args);
  const duration = Date.now() - start;

  let passed = success;
  if (passed && validate) {
    try {
      passed = validate(result);
    } catch (e: any) {
      passed = false;
    }
  }

  results.push({
    photon,
    method,
    success: passed,
    result: passed ? result : undefined,
    error: passed ? undefined : error || 'Validation failed',
    duration,
  });

  const status = passed ? '✅' : '❌';
  const argsStr = args.length > 0 ? ` (${args.join(', ')})` : '';
  console.log(`${status} ${photon}.${method}()${argsStr} - ${duration}ms`);
  if (!passed) {
    console.log(`   Error: ${(error || 'Validation failed').slice(0, 100)}`);
  }

  return passed;
}

// ============================================
// TIME PHOTON TESTS
// ============================================
async function testTime() {
  console.log('\n📅 Testing TIME photon...');

  await test('time', 'now', [], (r) => r.timezone && r.timestamp);
  await test('time', 'now', ['America/New_York'], (r) => r.timezone === 'America/New_York');
  await test('time', 'timezones', [], (r) => r.timezones && typeof r.timezones === 'object');
}

// ============================================
// MATH PHOTON TESTS
// ============================================
async function testMath() {
  console.log('\n🔢 Testing MATH photon...');

  await test('math', 'calculate', ['2 + 2'], (r) => r.result === 4);
  await test('math', 'calculate', ['sqrt(16)'], (r) => r.result === 4);
  await test('math', 'calculate', ['pow(2, 3)'], (r) => r.result === 8);
  await test('math', 'calculate', ['abs(-5)'], (r) => r.result === 5);
}

// ============================================
// WEB PHOTON TESTS
// ============================================
async function testWeb() {
  console.log('\n🌐 Testing WEB photon...');

  await test('web', 'search', ['typescript'], (r) => Array.isArray(r) && r.length > 0);
  // web.read returns markdown string directly
  await test('web', 'read', ['https://example.com'], (r) => typeof r === 'string' && r.includes('Example Domain'));
}

// ============================================
// FILESYSTEM PHOTON TESTS
// ============================================
async function testFilesystem() {
  console.log('\n📁 Testing FILESYSTEM photon...');

  // Note: filesystem workdir defaults to ~/.photon, not --dir
  // Use files within ~/.photon for testing
  const homePhoton = path.join(os.homedir(), '.photon');
  const testFile = path.join(homePhoton, '.test-file-' + Date.now() + '.txt');

  await test('filesystem', 'write', [testFile, 'Hello Photon!'], (r) => r.success);
  await test('filesystem', 'read', [testFile], (r) => r.content === 'Hello Photon!');
  await test('filesystem', 'exists', [testFile], (r) => r.exists === true);
  await test('filesystem', 'info', [testFile], (r) => r.size > 0);
  await test('filesystem', 'list', [homePhoton], (r) => r.files && r.files.length > 0);
  await test('filesystem', 'remove', [testFile], (r) => r.success);
}

// ============================================
// GIT PHOTON TESTS
// ============================================
async function testGit() {
  console.log('\n🔀 Testing GIT photon...');

  await test('git', 'status', [PHOTONS_DIR], (r) => r.branch);
  await test('git', 'log', [PHOTONS_DIR, '5'], (r) => r.commits && Array.isArray(r.commits));
  await test('git', 'diff', [PHOTONS_DIR], (r) => typeof r.diff === 'string' || r.diff === undefined);
}

// ============================================
// SQLITE PHOTON TESTS
// ============================================
async function testSqlite() {
  console.log('\n🗄️ Testing SQLITE photon...');
  console.log('   Note: SQLite requires stateful connection - testing open only');
  console.log('   Full testing requires BEAM integration tests');

  const dbPath = path.join(os.tmpdir(), `photon-test-${Date.now()}.db`);

  // Only test open - subsequent calls won't have connection state in CLI mode
  await test('sqlite', 'open', [dbPath], (r) => r.success);

  // Cleanup
  try { fs.unlinkSync(dbPath); } catch {}
}

// ============================================
// REDIS PHOTON TESTS (requires running Redis)
// ============================================
async function testRedis() {
  console.log('\n🔴 Testing REDIS photon...');

  await test('redis', 'ping', [], (r) => r.success && r.response === 'PONG');
  await test('redis', 'set', ['test-key', 'test-value'], (r) => r.success);
  await test('redis', 'get', ['test-key'], (r) => r.success && r.value === 'test-value');
  await test('redis', 'del', ['test-key'], (r) => r.success);
}

// ============================================
// POSTGRES PHOTON TESTS (requires running Postgres)
// ============================================
async function testPostgres() {
  console.log('\n🐘 Testing POSTGRES photon...');

  await test('postgres', 'query', ['SELECT 1 as test'], (r) => r.success && r.rows);
}

// ============================================
// MONGODB PHOTON TESTS (requires running MongoDB)
// ============================================
async function testMongodb() {
  console.log('\n🍃 Testing MONGODB photon...');

  await test('mongodb', 'ping', [], (r) => r.success);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🧪 Photon Test Suite');
  console.log('====================');
  console.log(`Photons dir: ${PHOTONS_DIR}`);

  const args = process.argv.slice(2);
  const specificTests = args.length > 0 ? args : ['time', 'math', 'web', 'filesystem', 'git', 'sqlite'];

  for (const t of specificTests) {
    switch (t) {
      case 'time': await testTime(); break;
      case 'math': await testMath(); break;
      case 'web': await testWeb(); break;
      case 'filesystem': await testFilesystem(); break;
      case 'git': await testGit(); break;
      case 'sqlite': await testSqlite(); break;
      case 'redis': await testRedis(); break;
      case 'postgres': await testPostgres(); break;
      case 'mongodb': await testMongodb(); break;
      default: console.log(`Unknown test: ${t}`);
    }
  }

  // Summary
  console.log('\n====================');
  console.log('📊 Test Summary\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.photon}.${r.method}(): ${r.error?.slice(0, 80)}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
}

main().catch(console.error);
