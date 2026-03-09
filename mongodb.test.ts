// Tests for mongodb.photon.ts

const testCollection = `photon_test_${Date.now()}`;

function isConnected(photon: any): boolean {
  return (photon as any).db !== undefined;
}

export async function afterAll(photon: any) {
  if (isConnected(photon)) {
    try {
      await photon.drop({ collection: testCollection });
    } catch {}
  }
}

export async function testCollections(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'MongoDB not connected' };
  const result = await photon.collections();
  if (!Array.isArray(result.collections)) throw new Error('Collections should be array');
}

export async function testInsertFind(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'MongoDB not connected' };
  await photon.insert({ collection: testCollection, document: { name: 'Test', value: 42 } });
  const result = await photon.find({ collection: testCollection, filter: { name: 'Test' } });
  if (result.count === 0) throw new Error('Document not found');
  if (result.documents[0].value !== 42) throw new Error('Wrong value');
}

export async function testCount(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'MongoDB not connected' };
  const result = await photon.count({ collection: testCollection });
  if (typeof result.count !== 'number') throw new Error('Count should be number');
}

export async function testDelete(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'MongoDB not connected' };
  await photon.insert({ collection: testCollection, document: { toDelete: true } });
  const result = await photon.remove({ collection: testCollection, filter: { toDelete: true } });
  if (result.deletedCount === 0) throw new Error('Document not deleted');
}
