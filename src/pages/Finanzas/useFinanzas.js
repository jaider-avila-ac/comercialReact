import { useState, useEffect, useCallback } from "react";
import { getResumen, facturasPendientes } from "../../services/finanzas.service";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export function useFinanzas() {
  const [kpis, setKpis] = useState({
    ingresos_facturas: 0,
    ingresos_mostrador: 0,
    ingresos_manuales: 0,
    total_en_caja: 0,
    egresos_compras: 0,
    egresos_manuales: 0,
    total_egresos: 0,
    balance_real: 0,
    saldo_pendiente: 0,
    cuentas_por_pagar: 0,
    pendientes_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    desde: `${new Date().getFullYear()}-01-01`,
    hasta: new Date().toISOString().split("T")[0],
  });

  // Expuesto para refresh manual desde event handlers (setState libre en handlers)
  const cargarKpis = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      const resumen = await getResumen(params);
      const pendData = await facturasPendientes();
      const pendCount = pendData.total ?? (Array.isArray(pendData.data) ? pendData.data.length : 0);
      setKpis({
        ingresos_facturas: resumen.ingresos_facturas || 0,
        ingresos_mostrador: resumen.ingresos_mostrador || 0,
        ingresos_manuales: resumen.ingresos_manuales || 0,
        total_en_caja: resumen.total_en_caja || 0,
        egresos_compras: resumen.egresos_compras || 0,
        egresos_manuales: resumen.egresos_manuales || 0,
        total_egresos: resumen.total_egresos || 0,
        balance_real: resumen.balance_real || 0,
        saldo_pendiente: resumen.saldo_pendiente || 0,
        cuentas_por_pagar: resumen.cuentas_por_pagar || 0,
        pendientes_count: pendCount,
      });
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Carga automática: llama al servicio directamente con .then() para no hacer
  // setState sincrónico en el cuerpo del efecto
  useEffect(() => {
    const params = {};
    if (filtros.desde) params.desde = filtros.desde;
    if (filtros.hasta) params.hasta = filtros.hasta;
    Promise.all([getResumen(params), facturasPendientes()])
      .then(([resumen, pendData]) => {
        const pendCount = pendData.total ?? (Array.isArray(pendData.data) ? pendData.data.length : 0);
        setKpis({
          ingresos_facturas: resumen.ingresos_facturas || 0,
          ingresos_mostrador: resumen.ingresos_mostrador || 0,
          ingresos_manuales: resumen.ingresos_manuales || 0,
          total_en_caja: resumen.total_en_caja || 0,
          egresos_compras: resumen.egresos_compras || 0,
          egresos_manuales: resumen.egresos_manuales || 0,
          total_egresos: resumen.total_egresos || 0,
          balance_real: resumen.balance_real || 0,
          saldo_pendiente: resumen.saldo_pendiente || 0,
          cuentas_por_pagar: resumen.cuentas_por_pagar || 0,
          pendientes_count: pendCount,
        });
      })
      .catch(error => console.error("Error cargando KPIs:", error))
      .finally(() => setLoading(false));
  }, [filtros]);

  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const limpiarFiltros = () => {
    setFiltros({ desde: "", hasta: "" });
  };

  return {
    kpis,
    loading,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar: cargarKpis,
    formatMoney,
  };
}
