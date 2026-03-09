/**
 * External tests for mongodb.photon.ts
 *
 * Run with: photon test mongodb
 */

export async function afterAll(photon: any): Promise<void> {
  if ((photon as any).db !== undefined) {
    try {
      await photon.drop({ collection: (photon as any).testCollection });
    } catch {}
  }
}

export async function testCollections(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'MongoDB not connected' };
  const result = await photon.collections();
  if (!Array.isArray(result.collections)) throw new Error('Collections should be array');
  return { passed: true };
}

export async function testInsertFind(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'MongoDB not connected' };
  const testCollection = (photon as any).testCollection;
  await photon.insert({ collection: testCollection, document: { name: 'Test', value: 42 } });
  const result = await photon.find({ collection: testCollection, filter: { name: 'Test' } });
  if (result.count === 0) throw new Error('Document not found');
  if (result.documents[0].value !== 42) throw new Error('Wrong value');
  return { passed: true };
}

export async function testCount(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'MongoDB not connected' };
  const testCollection = (photon as any).testCollection;
  const result = await photon.count({ collection: testCollection });
  if (typeof result.count !== 'number') throw new Error('Count should be number');
  return { passed: true };
}

export async function testDelete(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'MongoDB not connected' };
  const testCollection = (photon as any).testCollection;
  await photon.insert({ collection: testCollection, document: { toDelete: true } });
  const result = await photon.remove({ collection: testCollection, filter: { toDelete: true } });
  if (result.deletedCount === 0) throw new Error('Document not deleted');
  return { passed: true };
}
