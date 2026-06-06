export function isPostgresConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL?.trim());
}
