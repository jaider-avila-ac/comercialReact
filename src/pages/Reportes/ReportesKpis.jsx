import KpiCard from "../../components/ui/KpiCard";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

function DesgloseLine({ label, value, bold, colorClass = "text-gray-800" }) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? "pt-2 border-t border-gray-100 font-semibold" : ""}`}>
      <span className={bold ? "text-gray-700" : "text-gray-500"}>{label}</span>
      <span className={bold ? `font-bold ${colorClass}` : "font-medium text-gray-700"}>{fmt(value)}</span>
    </div>
  );
}

export default function ReportesKpis({ reporte }) {
  const balanceOk = (reporte.balance_real || 0) >= 0;

  return (
    <div className="space-y-3 mb-4">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard title="Facturado"      value={fmt(reporte.total_facturado)} iconClass="bi bi-receipt"         color="blue"   />
        <KpiCard title="Cobrado"        value={fmt(reporte.total_cobrado)}   iconClass="bi bi-cash-stack"      color="green"  />
        <KpiCard title="Saldo pendiente" value={fmt(reporte.saldo_pendiente)} iconClass="bi bi-hourglass-split" color="red"    />
        <KpiCard title="Total egresos"  value={fmt(reporte.total_egresos)}   iconClass="bi bi-arrow-down-circle" color="orange" />
        <KpiCard
          title="Balance real"
          value={fmt(reporte.balance_real)}
          iconClass="bi bi-wallet2"
          color={balanceOk ? "teal" : "red"}
        />
      </div>

      {/* Desglose ingresos / egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <i className="bi bi-arrow-up-circle text-green-500"></i>
            <span className="text-sm font-semibold text-gray-700">Desglose de ingresos</span>
          </div>
          <div className="p-4 space-y-2">
            <DesgloseLine label="Cobros de facturas"   value={reporte.ingresos_facturas}  />
            <DesgloseLine label="Ventas de mostrador"  value={reporte.ingresos_mostrador} />
            <DesgloseLine label="Ingresos manuales"    value={reporte.ingresos_manuales}  />
            <DesgloseLine label="Total ingresos" value={reporte.total_ingresos} bold colorClass="text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <i className="bi bi-arrow-down-circle text-red-500"></i>
            <span className="text-sm font-semibold text-gray-700">Desglose de egresos</span>
          </div>
          <div className="p-4 space-y-2">
            <DesgloseLine label="Egresos por compras"  value={reporte.egresos_compras}   />
            <DesgloseLine label="Egresos manuales"     value={reporte.egresos_manuales}  />
            <DesgloseLine label="Compras de contado"   value={reporte.compras_contado}   />
            <DesgloseLine label="Crédito a proveedores" value={reporte.credito_pendiente} />
            <DesgloseLine label="Total egresos" value={reporte.total_egresos} bold colorClass="text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
