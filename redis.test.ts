// Tests for redis.photon.ts

const testKey = `photon-test-${Date.now()}`;

function isConnected(photon: any): boolean {
  return (photon as any).client.isReady;
}

export async function afterAll(photon: any) {
  if (isConnected(photon)) {
    try {
      await photon.del({ keys: [testKey] });
    } catch {}
  }
}

export async function testSetGet(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Redis not connected' };
  await photon.set({ key: testKey, value: 'test-value' });
  const result = await photon.get({ key: testKey });
  if (result.value !== 'test-value') throw new Error('Value mismatch');
}

export async function testDel(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Redis not connected' };
  await photon.set({ key: testKey, value: 'to-delete' });
  await photon.del({ keys: [testKey] });
  try {
    await photon.get({ key: testKey });
    throw new Error('Key should be deleted');
  } catch (e) {
    if ((e as Error).message !== 'Key not found') throw e;
  }
}

export async function testExists(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Redis not connected' };
  await photon.set({ key: testKey, value: 'exists-test' });
  const result = await photon.exists({ key: testKey });
  if (!result.exists) throw new Error('Key should exist');
}

export async function testSetWithTtl(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Redis not connected' };
  await photon.set({ key: testKey, value: 'ttl-test', ttl: 60 });
  const result = await photon.ttl({ key: testKey });
  if (result.ttl === undefined || result.ttl <= 0) throw new Error('TTL should be positive');
}
