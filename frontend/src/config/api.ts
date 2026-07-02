const normalizeApiBase = (value: string | undefined): string => {
  if (!value) return "/api";

  const trimmed = value.trim();
  if (!trimmed) return "/api";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
};

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
