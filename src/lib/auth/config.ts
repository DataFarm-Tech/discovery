const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const resolvedBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : '/api';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolvedBaseUrl}${normalizedPath}`;
}
