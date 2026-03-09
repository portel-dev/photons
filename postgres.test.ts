// Tests for postgres.photon.ts

function isConnected(photon: any): boolean {
  return (photon as any).pool !== undefined;
}

export async function testQuery(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.query({ sql: 'SELECT 1 as test' });
  if (!result.rows || result.rows.length === 0) throw new Error('No rows returned');
  if (result.rows[0].test !== 1) throw new Error('Wrong value');
}

export async function testQueryWithParams(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.query({ sql: 'SELECT $1::int + $2::int as sum', params: [2, 3] });
  if (result.rows[0].sum !== 5) throw new Error('Wrong calculation');
}

export async function testTables(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.tables();
  if (!Array.isArray(result)) throw new Error('Tables should be array');
}

export async function testStats(photon: any) {
  if (!isConnected(photon)) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.stats();
  if (!result.database) throw new Error('Missing database name');
}
