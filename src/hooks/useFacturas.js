import { useState, useEffect, useCallback, useRef } from "react";
import { listarFacturas, emitirFactura, anularFactura } from "../services/facturas.service";
import { showToast, showConfirm } from "../utils/notifications";

export function useFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const isMountedRef = useRef(true);

  const loadFacturas = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarFacturas({ search, estado });
      if (isMountedRef.current) setFacturas(data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [search, estado]);

  useEffect(() => {
    isMountedRef.current = true;
    const run = async () => { await loadFacturas(); };
    run();
    return () => { isMountedRef.current = false; };
  }, [loadFacturas]);

  const handleEmitir = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Emitir esta factura? Se le asignará un número y no podrá editarse.", {
      title: "Emitir factura",
      okLabel: "Sí, emitir",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await emitirFactura(id);
      showToast("Factura emitida", "success");
      await loadFacturas();
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadFacturas]);

  const handleAnular = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Anular esta factura? Esta acción no se puede deshacer.", {
      title: "Anular factura",
      okLabel: "Sí, anular",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await anularFactura(id);
      showToast("Factura anulada", "success");
      await loadFacturas();
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadFacturas]);

  return {
    facturas, loading, error,
    search, setSearch,
    estado, setEstado,
    handleEmitir, handleAnular,
    reload: loadFacturas,
  };
}
