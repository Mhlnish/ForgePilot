/**
 * GitHub integration groundwork — interfaces only. No OAuth, no API calls.
 * A future implementation will run server-side (createServerFn) with the
 * user's own token and fill repositories.external_id / last_synced_at.
 */
export interface RemoteRepository {
  externalId: string;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  visibility: "public" | "private";
  defaultBranch: string;
}

export interface RepositoryProvider {
  id: "github";
  isConnected(): Promise<boolean>;
  listRepositories(): Promise<RemoteRepository[]>;
  getRepository(externalId: string): Promise<RemoteRepository | null>;
}

export const GITHUB_INTEGRATION_STATUS = "coming_soon" as const;

/** Parses owner/repo from a GitHub URL stored as metadata. */
export function parseGitHubUrl(
  url: string | null | undefined,
): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)\/?$/.exec(url.trim());
  return m ? { owner: m[1]!, repo: m[2]! } : null;
}
