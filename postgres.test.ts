/**
 * External tests for postgres.photon.ts
 *
 * Run with: photon test postgres
 */

export async function testQuery(photon: any) {
  if (!(photon as any).pool) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.query({ sql: 'SELECT 1 as test' });
  if (!result.rows || result.rows.length === 0) throw new Error('No rows returned');
  if (result.rows[0].test !== 1) throw new Error('Wrong value');
  return { passed: true };
}

export async function testQueryWithParams(photon: any) {
  if (!(photon as any).pool) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.query({ sql: 'SELECT $1::int + $2::int as sum', params: [2, 3] });
  if (result.rows[0].sum !== 5) throw new Error('Wrong calculation');
  return { passed: true };
}

export async function testTables(photon: any) {
  if (!(photon as any).pool) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.tables();
  if (!Array.isArray(result)) throw new Error('Tables should be array');
  return { passed: true };
}

export async function testStats(photon: any) {
  if (!(photon as any).pool) return { skipped: true, reason: 'Postgres not connected' };
  const result = await photon.stats();
  if (!result.database) throw new Error('Missing database name');
  return { passed: true };
}
