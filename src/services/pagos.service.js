import { apiFetch, csrfCookie } from "./api";

// ─── Servicio de Pagos ───────────────────────────────────────────────────────
// Endpoints utilizados en pagos.ui.js y otros módulos

/**
 * POST /facturas/{factura_id}/pagos
 * Registrar un nuevo pago (versión con factura en URL)
 */
export async function registrarPagoPorFactura(payload) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${payload.factura_id}/pagos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al registrar pago");
  return data;
}

/**
 * POST /pagos
 * Registrar un nuevo pago (versión directa)
 */
export async function registrarPago(payload) {
  await csrfCookie();
  const res = await apiFetch("/pagos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al registrar pago");
  return data;
}

/**
 * GET /facturas/{facturaId}/pagos
 * Obtener pagos de una factura
 */
export async function obtenerPagos(facturaId) {
  const res = await apiFetch(`/facturas/${facturaId}/pagos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al obtener pagos");
  return data.pagos || [];
}

/**
 * GET /facturas/{facturaId}/pagos
 * Obtener historial de pagos de una factura (alias)
 */
export async function obtenerHistorialPagos(facturaId) {
  const res = await apiFetch(`/facturas/${facturaId}/pagos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al obtener historial de pagos");
  return data.pagos || [];
}

/**
 * GET /clientes/{clienteId}
 * Obtener crédito disponible del cliente
 */
export async function obtenerCreditoCliente(clienteId) {
  const res = await apiFetch(`/clientes/${clienteId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar cliente");
  return data.cliente?.saldo_a_favor || data?.saldo_a_favor || 0;
}

/**
 * GET /clientes/{clienteId}
 * Obtener datos completos del cliente
 */
export async function obtenerCliente(clienteId) {
  const res = await apiFetch(`/clientes/${clienteId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar cliente");
  return data.cliente || data;
}