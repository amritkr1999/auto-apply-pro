import { API_BASE, buildApiUrl } from "../config/api";

export const getStoredToken = (): string | null => {
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch (e) {
    console.error("Error reading stored user token:", e);
  }
  return null;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  if (token) {
    return { "Authorization": `Bearer ${token}` };
  }
  return {};
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp) {
      // payload.exp is in seconds
      return payload.exp * 1000 < Date.now();
    }
  } catch (e) {
    console.error("Failed to parse JWT token expiration:", e);
  }
  return false;
};

export const handleSessionExpiration = (): void => {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("auth:session-expired"));
  if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
    window.location.href = "/?sessionExpired=true";
  }
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getStoredToken();

  if (token && isTokenExpired(token)) {
    handleSessionExpiration();
    throw new Error("Your session has expired. Please log in again.");
  }

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    handleSessionExpiration();
  }

  return response;
};

export { API_BASE, buildApiUrl };
