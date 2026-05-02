import { apiFetch, csrfCookie } from "./api";

// ─── Facturas ────────────────────────────────────────────────────────────────
export async function listarFacturas({ search = "", estado = "", cliente_id = "" } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (estado) qs.set("estado", estado);
  if (cliente_id) qs.set("cliente_id", cliente_id);
  const res = await apiFetch(`/facturas?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar facturas");
  return data;
}

export async function obtenerFactura(id) {
  const res = await apiFetch(`/facturas/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar factura");
  return data.factura;
}

export async function crearFactura(payload) {
  await csrfCookie();
  const res = await apiFetch("/facturas", { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al crear factura");
  return data.factura;
}

export async function actualizarFactura(id, payload) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al actualizar factura");
  return data.factura;
}

export async function eliminarFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo eliminar");
  return data;
}

export async function emitirFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}/emitir`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo emitir");
  return data.factura;
}

export async function anularFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}/anular`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo anular");
  return data.factura;
}

// ─── Facturas pendientes ─────────────────────────────────────────────────────
export async function facturasPendientes({ search = "" } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("estado", "EMITIDA");
  qs.set("pendiente", "true");

  const res = await apiFetch(`/facturas?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar pendientes");
  return data;
}

// ⭐ Buscar factura por número exacto (para cobro rápido)
export async function buscarFacturaPorNumero(numero) {
  const res = await apiFetch(`/facturas?search=${encodeURIComponent(numero)}&estado=EMITIDA`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al buscar factura");
  
  const rows = data.data || [];
  // Buscar coincidencia exacta por número
  const factura = rows.find(f => f.numero?.toLowerCase() === numero.toLowerCase());
  
  if (!factura) return null;
  
  // Obtener detalles completos de la factura
  const resDetalle = await apiFetch(`/facturas/${factura.id}`);
  const detalle = await resDetalle.json();
  if (!resDetalle.ok) throw new Error(detalle?.message || "Error al cargar detalle de factura");
  
  return detalle.factura;
}

// ─── Dashboard Resumen ───────────────────────────────────────────────────────
export async function getResumen(params = {}) {
  const qs = new URLSearchParams();
  if (params.desde) qs.append("desde", params.desde);
  if (params.hasta) qs.append("hasta", params.hasta);
  
  const url = qs.toString() ? `/dashboard?${qs}` : "/dashboard";
  const res = await apiFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar resumen");
  return data.resumen || data;
}

// ─── Pagos ───────────────────────────────────────────────────────────────────
export async function listarPagos({ search = "", formaPago = "", fechaDesde = "", fechaHasta = "" } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.append("search", search);
  if (formaPago) qs.append("forma_pago", formaPago);
  if (fechaDesde) qs.append("fecha_desde", fechaDesde);
  if (fechaHasta) qs.append("fecha_hasta", fechaHasta);
  
  const res = await apiFetch(`/pagos?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar pagos");
  return data;
}

// ─── Ingresos ────────────────────────────────────────────────────────────────
export async function getIngresos(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.append("search", params.search);
  if (params.fecha_desde) qs.append("fecha_desde", params.fecha_desde);
  if (params.fecha_hasta) qs.append("fecha_hasta", params.fecha_hasta);
  
  const res = await apiFetch(`/ingresos/manuales${qs.toString() ? `?${qs}` : ""}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar ingresos");
  return data;
}

export async function crearIngreso(data) {
  await csrfCookie();
  const res = await apiFetch("/ingresos/manuales", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarIngreso(id, data) {
  await csrfCookie();
  const res = await apiFetch(`/ingresos/manuales/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function anularIngreso(id) {
  await csrfCookie();
  const res = await apiFetch(`/ingresos/manuales/${id}/anular`, {
    method: "POST",
  });
  return res.json();
}

// ─── Egresos ─────────────────────────────────────────────────────────────────
export async function getEgresos(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.append("search", params.search);
  if (params.fecha_desde) qs.append("fecha_desde", params.fecha_desde);
  if (params.fecha_hasta) qs.append("fecha_hasta", params.fecha_hasta);
  
  const res = await apiFetch(`/egresos/manuales${qs.toString() ? `?${qs}` : ""}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar egresos");
  return data;
}

export async function crearEgreso(data) {
  await csrfCookie();
  const res = await apiFetch("/egresos/manuales", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarEgreso(id, data) {
  await csrfCookie();
  const res = await apiFetch(`/egresos/manuales/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function anularEgreso(id) {
  await csrfCookie();
  const res = await apiFetch(`/egresos/manuales/${id}/anular`, {
    method: "POST",
  });
  return res.json();
}