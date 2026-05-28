import { refreshAccessToken } from "./oauth";
import {
  getGscConnection,
  updateGscTokens,
  type GscConnectionRow,
} from "./search-console-db";

const EXPIRY_BUFFER_MS = 60_000;

export async function getValidGscAccessToken(
  projectId: string
): Promise<{ accessToken: string; connection: GscConnectionRow } | null> {
  const connection = await getGscConnection(projectId);
  if (!connection) return null;

  const expiresAt = new Date(connection.access_token_expires_at).getTime();
  if (Date.now() < expiresAt - EXPIRY_BUFFER_MS) {
    return { accessToken: connection.access_token, connection };
  }

  try {
    const tokens = await refreshAccessToken(connection.refresh_token);
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);
    await updateGscTokens(projectId, tokens.access_token, newExpiry);
    return {
      accessToken: tokens.access_token,
      connection: {
        ...connection,
        access_token: tokens.access_token,
        access_token_expires_at: newExpiry.toISOString(),
      },
    };
  } catch {
    return null;
  }
}
