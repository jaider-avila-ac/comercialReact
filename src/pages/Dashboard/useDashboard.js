import { useState, useEffect, useCallback } from "react";
import { obtenerDashboard } from "../../services/dashboard.service";

const DASHBOARD_VACIO = {
  resumen: {
    total_clientes: 0,
    total_items: 0,
    cotizaciones_activas: 0,
    facturas_borrador: 0,
    total_en_caja: 0,
    saldo_pendiente: 0,
  },
  ultimasFacturas: [],
  ultimosPagos: []
};

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState(DASHBOARD_VACIO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDashboard();
      // Asegurar que tenga la estructura mínima
      setDashboardData({
        resumen: data.resumen || DASHBOARD_VACIO.resumen,
        ultimasFacturas: data.ultimasFacturas || [],
        ultimosPagos: data.ultimosPagos || [],
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      // No mostrar error si es solo que no hay datos
      setDashboardData(DASHBOARD_VACIO);
      setError(null); // Limpiar error porque no hay datos no es error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    reload: loadDashboard
  };
}