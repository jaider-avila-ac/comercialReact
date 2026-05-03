import { apiFetch, csrfCookie } from "./api";
import { USER_KEY, TOKEN_KEY } from "../config/config";

export async function validarCorreo(email) {
  await csrfCookie();
  const res = await apiFetch("/auth/iniciar", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "El correo no está registrado.");
  return { sessionToken: data.session_token };
}

export async function validarPassword(sessionToken, password) {
  await csrfCookie();
  const res = await apiFetch("/auth/verificar", {
    method: "POST",
    body: JSON.stringify({ session_token: sessionToken, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Contraseña incorrecta.");
  const userData = data.usuario || data.user;
  if (!userData) throw new Error("Error al obtener datos del usuario.");
  return { token: data.access_token, usuario: userData };
}

export async function obtenerPerfil() {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) throw new Error("Error al obtener perfil");
    return res.json();
  } catch (error) {
    console.error("Error obtener perfil:", error);
    throw error;
  }
}

export async function cerrarSesionBackend() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

// Funciones de localStorage (igual que en vanilla JS)
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user) {
  // Guardar usuario completo
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Si tiene token, guardarlo también por separado para fácil acceso
  if (user.access_token) {
    localStorage.setItem(TOKEN_KEY, user.access_token);
  }
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function hasRole(...roles) {
  const u = getUser();
  return u ? roles.includes(u.rol) : false;
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  const u = getUser();
  return u?.access_token || null;
}