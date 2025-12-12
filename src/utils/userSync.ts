import type { AuthUser } from '../types';

export type QueryFunction = (
  sql: string,
  params: unknown[]
) => Promise<{ rows: Record<string, unknown>[] }>;

export async function syncUser(
  query: QueryFunction,
  logtoId: string,
  email?: string,
  name?: string
): Promise<number> {
  const existing = await query('SELECT id FROM users WHERE logto_id = $1', [logtoId]);

  if (existing.rows.length > 0) {
    await query(
      'UPDATE users SET email = COALESCE($2, email), name = COALESCE($3, name), updated_at = NOW() WHERE logto_id = $1',
      [logtoId, email, name]
    );
    return existing.rows[0].id as number;
  }

  const result = await query(
    'INSERT INTO users (logto_id, email, name) VALUES ($1, $2, $3) RETURNING id',
    [logtoId, email, name]
  );
  return result.rows[0].id as number;
}

export async function getUserByLogtoId(
  query: QueryFunction,
  logtoId: string
): Promise<AuthUser | null> {
  const result = await query(
    'SELECT id, logto_id, email, name FROM users WHERE logto_id = $1',
    [logtoId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.logto_id as string,
    email: row.email as string | undefined,
    name: row.name as string | undefined,
    dbUserId: row.id as number,
  };
}