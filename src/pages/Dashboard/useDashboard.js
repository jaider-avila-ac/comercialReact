import { useState, useEffect, useCallback } from "react";
import { obtenerDashboard } from "../../services/dashboard.service";

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState({
    resumen: {},
    ultimasFacturas: [],
    ultimosPagos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expuesto para refresh manual desde event handlers
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga automática al montar: .then() evita setState sincrónico en el efecto
  useEffect(() => {
    obtenerDashboard()
      .then(data => setDashboardData(data))
      .catch(err => {
        console.error("Error loading dashboard:", err);
        setError(err.message || "Error al cargar el dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    dashboardData,
    loading,
    error,
    reload: loadDashboard
  };
}
