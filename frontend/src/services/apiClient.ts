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

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
}

export const apiFetch = async (input: RequestInfo | URL, init?: ApiFetchOptions): Promise<Response> => {
  const token = getStoredToken();

  if (token && isTokenExpired(token)) {
    handleSessionExpiration();
    throw new Error("Your session has expired. Please log in again.");
  }

  const { timeoutMs = 12000, maxRetries, ...fetchInit } = init || {};
  const method = (fetchInit.method || "GET").toUpperCase();
  const retries = maxRetries !== undefined ? maxRetries : method === "GET" ? 2 : 0;

  const headers = new Headers(fetchInit?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    // Merge existing signal if passed with cross-browser fallback
    let signal: AbortSignal = controller.signal;
    if (fetchInit.signal) {
      if (typeof AbortSignal !== "undefined" && typeof (AbortSignal as unknown as { any?: Function }).any === "function") {
        signal = (AbortSignal as unknown as { any: (signals: AbortSignal[]) => AbortSignal }).any([fetchInit.signal, controller.signal]);
      } else {
        fetchInit.signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }

    try {
      const response = await fetch(input, {
        ...fetchInit,
        headers,
        signal,
      });

      clearTimeout(timerId);

      if (response.status === 401) {
        handleSessionExpiration();
      }

      return response;
    } catch (err: unknown) {
      clearTimeout(timerId);

      const errorObj = err as Error;
      const isAbort = errorObj?.name === "AbortError";
      const isNetworkErr = errorObj?.name === "TypeError" || !navigator.onLine;

      lastError = isAbort
        ? new Error("Request timed out. Please check your internet connection.")
        : isNetworkErr
        ? new Error("Network error. Unable to reach server.")
        : errorObj;

      // Only retry if it was a timeout or network error and we have retries remaining
      if ((isAbort || isNetworkErr) && attempt < retries) {
        attempt++;
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Failed to execute network request");
};

export { API_BASE, buildApiUrl };
