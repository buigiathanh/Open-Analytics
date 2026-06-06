import { queryOne } from "@/lib/db/pool";

const VERIFY_TTL_MS = 5 * 60 * 1000;

export async function upsertVerificationChallenge(
  siteKey: string,
  token: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS).toISOString();
  await queryOne(
    `insert into bot_verify_challenges (site_key, token, expires_at, completed_at)
     values ($1, $2, $3, null)
     on conflict (site_key) do update
       set token = excluded.token,
           expires_at = excluded.expires_at,
           completed_at = null`,
    [siteKey, token, expiresAt]
  );
}

export async function markVerificationComplete(
  siteKey: string,
  token: string
): Promise<boolean> {
  const row = await queryOne(
    `update bot_verify_challenges
     set completed_at = now()
     where site_key = $1
       and token = $2
       and expires_at > now()
       and completed_at is null
     returning site_key`,
    [siteKey, token]
  );
  return row != null;
}

export async function isVerificationComplete(siteKey: string): Promise<boolean> {
  const row = await queryOne(
    `select completed_at from bot_verify_challenges
     where site_key = $1 and completed_at is not null
     limit 1`,
    [siteKey]
  );
  return row?.completed_at != null;
}
