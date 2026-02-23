const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const defaultApiUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : '/api';

const resolvedBaseUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolvedBaseUrl}${normalizedPath}`;
}
