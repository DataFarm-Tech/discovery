const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const defaultApiUrl = process.env.NODE_ENV === "development"
  ? "http://localhost:8000"
  : "/api";

// export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");
export const API_BASE_URL = ("https://discovery-datafarm.com.au:8081").replace(/\/+$/, "");

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
