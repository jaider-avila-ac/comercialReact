import { API_BASE_URL, TOKEN_KEY, USER_KEY } from "../config/config";

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function setApiToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

function getAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.log("⚠️ No hay token disponible para:", path);
  }

  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  const p = path.startsWith("/") ? path : `/${path}`;
  
const response = await fetch(`${API_BASE_URL}/api${p}`, {
    ...options,
    headers,
    credentials: "include",
  });
  
  if (response.status === 401 && unauthorizedHandler && !path.includes("/auth/")) {
    console.warn("⚠️ 401 Unauthorized en:", path);
    unauthorizedHandler();
  }
  
  return response;
}

export async function csrfCookie() {
  const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
  return response;
}