import { Link } from "react-router-dom";
import { useDashboard } from "./useDashboard";
import { formatMoney, formatNumber, FORMAS_PAGO } from "../../services/dashboard.service";
import KpiCard from "../../components/ui/KpiCard";
import DataTable from "../../components/ui/DataTable";

const EstadoBadge = ({ estado }) => {
  const styles = {
    BORRADOR: "bg-gray-100 text-gray-600",
    EMITIDA: "bg-green-100 text-green-700"
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${styles[estado] || styles.BORRADOR}`}>
      {estado}
    </span>
  );
};

export default function DashboardPage() {
 
  const { dashboardData, loading, error, reload } = useDashboard();
  const { resumen, ultimasFacturas, ultimosPagos } = dashboardData;



  const facturasPendientes = ultimasFacturas.filter(f => (f.saldo || 0) > 0);
  const totalSaldoPendiente = facturasPendientes.reduce((sum, f) => sum + (f.saldo || 0), 0);

  const facturasColumns = [
    { key: "numero", label: "Número", sortable: true },
    { key: "cliente_nombre", label: "Cliente", sortable: true },
    { key: "estado", label: "Estado", sortable: true },
    { key: "total", label: "Total", sortable: true, align: "right" },
    { key: "saldo", label: "Saldo", sortable: true, align: "right" },
  ];

  const facturasRows = ultimasFacturas.map(f => ({
    id: f.id,
    numero: f.numero,
    cliente_nombre: f.cliente?.nombre_razon_social || "—",
    estado: <EstadoBadge estado={f.estado} />,
    total: formatMoney(f.total),
    saldo: f.saldo > 0 ? 
      <span className="text-red-600 font-semibold">{formatMoney(f.saldo)}</span> : 
      <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
        <i className="bi bi-check2-circle"></i> Pagada
      </span>,
  }));

  const pendientesColumns = [
    { key: "numero", label: "Factura", sortable: true },
    { key: "cliente_nombre", label: "Cliente", sortable: true },
    { key: "total", label: "Total", sortable: true, align: "right" },
    { key: "saldo", label: "Saldo", sortable: true, align: "right" },
  ];

  const pendientesRows = facturasPendientes.map(f => ({
    id: f.id,
    numero: f.numero,
    cliente_nombre: f.cliente?.nombre_razon_social || "—",
    total: formatMoney(f.total),
    saldo: <span className="text-red-600 font-semibold">{formatMoney(f.saldo)}</span>,
  }));

  const pagosColumns = [
    { key: "numero", label: "Recibo", sortable: true },
    { key: "fecha", label: "Fecha", sortable: true },
    { key: "cliente_nombre", label: "Cliente", sortable: true },
    { key: "forma_pago", label: "Forma", sortable: true, align: "center" },
    { key: "monto", label: "Monto recibido", sortable: true, align: "right" },
  ];

  const pagosRows = ultimosPagos.map(p => ({
    id: p.id,
    numero: p.numero || "—",
    fecha: p.fecha ? String(p.fecha).substring(0, 10) : "—",
    cliente_nombre: p.cliente_nombre || "—",
    forma_pago: <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{FORMAS_PAGO[p.forma_pago] || p.forma_pago || "—"}</span>,
    monto: <span className="text-green-600 font-semibold">{formatMoney(p.monto || 0)}</span>,
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <i className="bi bi-exclamation-triangle text-4xl"></i>
          <p className="text-lg font-semibold mt-2">Error al cargar el dashboard</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
            <i className="bi bi-arrow-repeat"></i> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4" style={{ maxWidth: '1400px' }}>
      
      {/* Action Buttons — alineados a la derecha */}
      <div className="flex justify-end items-center mb-3 gap-2 flex-wrap">
        <Link to="/venta-rapida" className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-gray-900 transition-all shadow-sm min-w-25">
          <i className="bi bi-lightning-charge-fill text-xl"></i>
          <span className="text-xs font-semibold">Venta rápida</span>
        </Link>
        <Link to="/finanzas/cobro-rapido" className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:text-blue-600 transition-all min-w-25">
          <i className="bi bi-cash-coin text-xl"></i>
          <span className="text-xs font-semibold">Registrar pago</span>
        </Link>
        <Link to="/facturas/nueva" className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm min-w-25">
          <i className="bi bi-file-earmark-plus text-xl"></i>
          <span className="text-xs font-semibold">Nueva factura</span>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <KpiCard title="Clientes"      value={formatNumber(resumen.total_clientes)}       iconClass="bi bi-people-fill"           color="white" iconColor="blue"    to="/clientes" />
        <KpiCard title="Catálogo"      value={formatNumber(resumen.total_items)}           iconClass="bi bi-box-seam-fill"          color="white" iconColor="indigo"  to="/catalogo" />
        <KpiCard title="Cotizaciones"  value={formatNumber(resumen.cotizaciones_activas)}  iconClass="bi bi-clipboard2-check-fill"  color="white" iconColor="teal"    to="/cotizaciones" />
        <KpiCard title="Borradores"    value={formatNumber(resumen.facturas_borrador)}     iconClass="bi bi-pencil-square"          color="white" iconColor="amber"   to="/facturas?estado=BORRADOR" />
      </div>

      {/* KPIs financieros grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <KpiCard title="Total recaudado" value={formatMoney(resumen.total_en_caja)}     iconClass="bi bi-check-circle-fill"       color="white" iconColor="emerald" to="/finanzas" large />
        <KpiCard title="Saldo pendiente" value={formatMoney(resumen.saldo_pendiente)}   iconClass="bi bi-exclamation-circle-fill" color="white" iconColor="red"     to="/finanzas" large />
      </div>

      {/* Paneles de detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Últimas facturas */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-800 flex items-center gap-1">
                <i className="bi bi-file-earmark-text"></i> Últimas facturas
              </span>
              <Link to="/facturas" className="text-xs font-medium text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
                Ver todas <i className="bi bi-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
          <DataTable
            columns={facturasColumns}
            rows={facturasRows}
            loading={loading}
            empty="Sin facturas aún"
            defaultSort={{ key: "numero", dir: "desc" }}
          />
        </div>

        {/* Por cobrar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b bg-red-50 border-red-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wide text-red-800 flex items-center gap-1">
                <i className="bi bi-hourglass-split"></i> Por cobrar
              </span>
              <Link to="/finanzas" className="text-xs font-medium text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                Ir a cobros <i className="bi bi-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
          <DataTable
            columns={pendientesColumns}
            rows={pendientesRows}
            loading={loading}
            empty="Sin facturas pendientes"
            defaultSort={{ key: "numero", dir: "asc" }}
          />
          {pendientesRows.length > 0 && (
            <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-xs text-gray-600">
              <span className="text-gray-500">Total saldo pendiente:</span>
              <span className="font-bold text-red-600 ml-2">{formatMoney(totalSaldoPendiente)}</span>
            </div>
          )}
        </div>

        {/* Últimos pagos — ancho completo */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b bg-green-50 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wide text-green-800 flex items-center gap-1">
                <i className="bi bi-receipt"></i> Últimos pagos recibidos
              </span>
              <Link to="/finanzas" className="text-xs font-medium text-green-600 hover:bg-green-100 px-2 py-1 rounded transition-colors">
                Ver historial <i className="bi bi-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>
          <DataTable
            columns={pagosColumns}
            rows={pagosRows}
            loading={loading}
            empty="Sin pagos registrados aún"
            defaultSort={{ key: "fecha", dir: "desc" }}
          />
        </div>
      </div>
    </div>
  );
}