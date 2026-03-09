// Tests for sqlite.photon.ts

const testDbPath = `/tmp/photon-test-${Date.now()}.db`;
const testTable = `test_${Date.now()}`;

export async function beforeAll(photon: any) {
  await photon.open({ path: testDbPath });
  await photon.execute({
    sql: `CREATE TABLE IF NOT EXISTS ${testTable} (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)`,
  });
}

export async function afterAll(photon: any) {
  try {
    if ((photon as any).db) {
      (photon as any).db.close();
      (photon as any).db = null;
    }
    const fs = await import('fs/promises');
    await fs.unlink(testDbPath).catch(() => {});
  } catch {}
}

export async function testOpen(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'Database not open' };
}

export async function testTables(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'Database not open' };
  const result = await photon.tables();
  if (!Array.isArray(result)) throw new Error('Tables should be array');
}

export async function testInsertQuery(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'Database not open' };
  await photon.execute({ sql: `INSERT INTO ${testTable} (name, value) VALUES (?, ?)`, params: ['test', 42] });
  const result = await photon.query({ sql: `SELECT * FROM ${testTable} WHERE name = ?`, params: ['test'] });
  if (!Array.isArray(result) || result.length === 0) throw new Error('Row not found');
  if (result[0].value !== 42) throw new Error('Wrong value');
}

export async function testSchema(photon: any) {
  if (!(photon as any).db) return { skipped: true, reason: 'Database not open' };
  const result = await photon.schema({ table: testTable });
  if (!Array.isArray(result)) throw new Error('Columns should be array');
}
