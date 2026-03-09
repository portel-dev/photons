/**
 * External tests for redis.photon.ts
 *
 * Run with: photon test redis
 */

export async function afterAll(photon: any): Promise<void> {
  if ((photon as any).client?.isReady) {
    try {
      await photon.del({ keys: [(photon as any).testKey] });
    } catch {}
  }
}

export async function testSetGet(photon: any) {
  if (!(photon as any).client?.isReady) return { skipped: true, reason: 'Redis not connected' };
  const testKey = (photon as any).testKey;
  await photon.set({ key: testKey, value: 'test-value' });
  const result = await photon.get({ key: testKey });
  if (result.value !== 'test-value') throw new Error('Value mismatch');
  return { passed: true };
}

export async function testDel(photon: any) {
  if (!(photon as any).client?.isReady) return { skipped: true, reason: 'Redis not connected' };
  const testKey = (photon as any).testKey;
  await photon.set({ key: testKey, value: 'to-delete' });
  await photon.del({ keys: [testKey] });
  try {
    await photon.get({ key: testKey });
    throw new Error('Key should be deleted');
  } catch (e) {
    if ((e as Error).message !== 'Key not found') throw e;
  }
  return { passed: true };
}

export async function testExists(photon: any) {
  if (!(photon as any).client?.isReady) return { skipped: true, reason: 'Redis not connected' };
  const testKey = (photon as any).testKey;
  await photon.set({ key: testKey, value: 'exists-test' });
  const result = await photon.exists({ key: testKey });
  if (!result.exists) throw new Error('Key should exist');
  return { passed: true };
}

export async function testSetWithTtl(photon: any) {
  if (!(photon as any).client?.isReady) return { skipped: true, reason: 'Redis not connected' };
  const testKey = (photon as any).testKey;
  await photon.set({ key: testKey, value: 'ttl-test', ttl: 60 });
  const result = await photon.ttl({ key: testKey });
  if (result.ttl === undefined || result.ttl <= 0) throw new Error('TTL should be positive');
  return { passed: true };
}
