import { useState, useCallback, useEffect, useRef } from "react";
import { getReporteKPIs, getRendimientoItems } from "../../services/reportes.service";
import { showToast } from "../../utils/notifications";

const getDefaultFiltros = () => {
  const hoy = new Date();
  return {
    desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0],
    hasta: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split("T")[0],
  };
};

const KPIS_VACIO = {
  total_facturado: 0, total_cobrado: 0, saldo_pendiente: 0,
  ingresos_facturas: 0, ingresos_mostrador: 0, ingresos_manuales: 0, total_ingresos: 0,
  egresos_compras: 0, egresos_manuales: 0, total_egresos: 0,
  compras_contado: 0, credito_pendiente: 0, balance_real: 0,
};

export function useReportes() {
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(KPIS_VACIO);
  const [items, setItems] = useState([]);
  const [filtros, setFiltros] = useState(getDefaultFiltros);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadReporte = useCallback((desde, hasta) => {
    if (!desde || !hasta) {
      showToast("Seleccione fecha desde y hasta", "warning");
      return;
    }
    setLoading(true);
    Promise.all([
      getReporteKPIs({ desde, hasta }),
      getRendimientoItems({ desde, hasta }),
    ])
      .then(([kpisData, rendData]) => {
        if (!mountedRef.current) return;
        setKpis({
          total_facturado:    kpisData.total_facturado    || 0,
          total_cobrado:      kpisData.total_cobrado      || 0,
          saldo_pendiente:    kpisData.saldo_pendiente    || 0,
          ingresos_facturas:  kpisData.ingresos_facturas  || 0,
          ingresos_mostrador: kpisData.ingresos_mostrador || 0,
          ingresos_manuales:  kpisData.ingresos_manuales  || 0,
          total_ingresos:     kpisData.total_ingresos     || 0,
          egresos_compras:    kpisData.egresos_compras    || 0,
          egresos_manuales:   kpisData.egresos_manuales   || 0,
          total_egresos:      kpisData.total_egresos      || 0,
          compras_contado:    kpisData.compras_contado    || 0,
          credito_pendiente:  kpisData.credito_pendiente  || 0,
          balance_real:       kpisData.balance_real       || 0,
        });
        setItems(rendData.rendimiento_items || []);
      })
      .catch(err => {
        if (!mountedRef.current) return;
        showToast(err.message || "Error al cargar el reporte", "error");
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, []);

  // Carga inicial con las fechas por defecto
  useEffect(() => {
    const { desde, hasta } = getDefaultFiltros();
    loadReporte(desde, hasta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizarFiltros = useCallback((nuevos) => {
    setFiltros(prev => ({ ...prev, ...nuevos }));
  }, []);

  const generarReporte = useCallback(() => {
    loadReporte(filtros.desde, filtros.hasta);
  }, [loadReporte, filtros]);

  return {
    loading,
    kpis,
    items,
    filtros,
    actualizarFiltros,
    generarReporte,
  };
}
