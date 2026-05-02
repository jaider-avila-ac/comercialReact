import { Link } from "react-router-dom";
import { RefreshCw, Search, X, Wallet, Zap, PlusCircle, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import KpiCard from "../../components/ui/KpiCard";
import { useFinanzas } from "./useFinanzas";

export default function FinanzasPage() {
  const { kpis, loading, filtros, actualizarFiltros, limpiarFiltros, recargar, formatMoney } = useFinanzas();

  const handleFiltroChange = (campo, valor) => {
    actualizarFiltros({ [campo]: valor });
  };

  const handleFiltrar = () => {
    recargar();
  };

  const handleLimpiar = () => {
    limpiarFiltros();
    setTimeout(() => recargar(), 0);
  };

  const mostrarPendientes = kpis.pendientes_count > 0;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Finanzas
          </h1>
          <p className="text-sm text-gray-500">Cobros, ingresos, egresos y balance de caja</p>
        </div>
        <Button text="Actualizar KPIs" icon={RefreshCw} variant="outline" onClick={recargar} disabled={loading} />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            label="Desde"
            type="date"
            value={filtros.desde}
            onChange={(e) => handleFiltroChange("desde", e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={filtros.hasta}
            onChange={(e) => handleFiltroChange("hasta", e.target.value)}
          />
          <div className="flex gap-2 items-end">
            <Button text="Filtrar" icon={Search} variant="primary" onClick={handleFiltrar} />
            <Button text="Limpiar" icon={X} variant="outline" onClick={handleLimpiar} />
          </div>
        </div>
      </div>

      {/* KPIs - SIN iconos, SOLO texto */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard
          title="Ingresos facturas"
          value={formatMoney(kpis.ingresos_facturas)}
          subtitle="Pagos aplicados a facturas"
          color="green"
        />
        <KpiCard
          title="Mostrador"
          value={formatMoney(kpis.ingresos_mostrador)}
          subtitle="Ventas de contado"
          color="purple"
        />
        <KpiCard
          title="Entradas Totales"
          value={formatMoney(kpis.total_en_caja)}
          subtitle="Facturas + Mostrador + Ingresos manuales"
          color="blue"
        />
        <KpiCard
          title="Ingresos manuales"
          value={formatMoney(kpis.ingresos_manuales)}
          subtitle="Entradas adicionales"
          color="orange"
        />
        <KpiCard
          title="Egresos"
          value={formatMoney(kpis.total_egresos)}
          subtitle="Compras + Gastos manuales"
          color="red"
        />
        <KpiCard
          title="Balance real"
          value={formatMoney(kpis.balance_real)}
          subtitle="Total en caja − Egresos"
          color={kpis.balance_real >= 0 ? "green" : "red"}
          valueColor={kpis.balance_real >= 0 ? "text-emerald-600" : "text-red-600"}
        />
      </div>

      {/* Spinner de carga */}
      {loading && (
        <div className="flex justify-center items-center py-2 mb-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-500">Actualizando...</span>
        </div>
      )}

      {/* Indicador de pendientes */}
      {mostrarPendientes && (
        <div className="mb-4">
          <Link to="/finanzas/pendientes" className="block">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between hover:bg-red-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {kpis.pendientes_count}
                </span>
                <span className="text-red-700 font-medium">Facturas con saldo pendiente</span>
              </div>
              <span className="text-red-600 text-sm">Ver detalles →</span>
            </div>
          </Link>
        </div>
      )}

      {/* Módulos adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/finanzas/cobro-rapido" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Cobro rápido
            </h6>
            <p className="text-xs text-gray-500 mt-1">Buscar factura y registrar pago.</p>
          </div>
        </Link>

        <Link to="/finanzas/pendientes" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              Saldos pendientes
            </h6>
            <p className="text-xs text-gray-500 mt-1">Facturas con saldo pendiente.</p>
          </div>
        </Link>

        <Link to="/finanzas/ingresos" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-green-500" />
              Ingresos
            </h6>
            <p className="text-xs text-gray-500 mt-1">Registrar y consultar ingresos manuales.</p>
          </div>
        </Link>

        <Link to="/finanzas/egresos" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Egresos
            </h6>
            <p className="text-xs text-gray-500 mt-1">Registrar y consultar egresos.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}