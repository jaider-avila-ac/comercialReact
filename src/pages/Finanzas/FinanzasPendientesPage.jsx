import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";
import { facturasPendientes } from "../../services/facturas.service";
import { showToast } from "../../utils/notifications";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export default function FinanzasPendientesPage() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cargar facturas pendientes
  const loadFacturas = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const data = await facturasPendientes({ search });
      const rows = data.data || [];

      const facturasData = rows.map(f => {
        const total = parseFloat(f.total) || 0;
        const pagado = parseFloat(f.total_pagado) || 0;
        const saldo = parseFloat(f.saldo) || (total - pagado);

        return {
          id: f.id,
          numero: f.numero || `#${f.id}`,
          cliente_nombre: f.cliente?.nombre_razon_social || "—",
          fecha: f.fecha?.substring(0, 10) || "—",
          total: formatMoney(total),
          total_raw: total,
          pagado: formatMoney(pagado),
          pagado_raw: pagado,
          saldo: formatMoney(saldo),
          saldo_raw: saldo,
          cliente_id: f.cliente_id,
        };
      });

      if (isMountedRef.current) {
        setFacturas(facturasData);
      }
    } catch (error) {
      console.error("Error loading pendientes:", error);
      if (isMountedRef.current) {
        showToast(error.message, "error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [search]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadFacturas();
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, loadFacturas]);

  // Limpiar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleRefresh = () => {
    loadFacturas();
  };

  const handleCobrar = (row) => {
    const factura = facturas.find(f => f.id === row.id);
    if (factura) {
      setFacturaSeleccionada(factura);
      setModalOpen(true);
    }
  };

  const handlePagoOk = async () => {
    // Recargar la lista después de un pago exitoso
    await loadFacturas();
  };

  const columns = [
    { key: "numero", label: "Factura", sortable: true },
    { key: "cliente_nombre", label: "Cliente", sortable: true },
    { key: "fecha", label: "Fecha", sortable: true },
    { key: "total", label: "Total", align: "right", sortable: true },
    { key: "pagado", label: "Pagado", align: "right", sortable: true },
    { key: "saldo", label: "Saldo", align: "right", sortable: true },
  ];

  const actions = (row) => (
    <div className="flex gap-1">
      <button
        onClick={() => handleCobrar(row)}
        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
        title="Cobrar"
      >
        <i className="bi bi-cash-coin"></i> Cobrar
      </button>
    </div>
  );

  const rows = facturas.map(f => ({
    id: f.id,
    numero: (
      <Link to={`/facturas/ver/${f.id}`} className="text-blue-600 hover:underline font-semibold">
        {f.numero}
      </Link>
    ),
    cliente_nombre: f.cliente_nombre,
    fecha: f.fecha,
    total: f.total,
    pagado: <span className="text-green-600 font-semibold">{f.pagado}</span>,
    saldo: <span className="text-red-600 font-semibold">{f.saldo}</span>,
  }));

  // Calcular SOLO el total de saldos pendientes
  const totalSaldoPendiente = facturas.reduce((sum, f) => sum + (f.saldo_raw || 0), 0);

  const footerTotales = (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex justify-end gap-6 text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-gray-500">Total saldo pendiente →</span>
          <span className="text-red-600 font-semibold min-w-[130px] text-right">
            {formatMoney(totalSaldoPendiente)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-hourglass text-red-500"></i>
            Saldos pendientes
          </h1>
          <p className="text-sm text-gray-500">Facturas emitidas con saldo pendiente</p>
        </div>
        <Link to="/finanzas">
          <Button text="Volver a finanzas" icon={ArrowLeft} variant="outline" />
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Número de factura o cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button text="Refrescar" icon={RefreshCw} variant="outline" onClick={handleRefresh} disabled={loading} />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          rows={rows}
          actions={actions}
          loading={loading}
          empty={
            <div className="text-center py-8">
              <i className="bi bi-check2-circle text-green-500 text-3xl block mb-2"></i>
              <p className="text-gray-500">Sin facturas pendientes. ¡Todo al día!</p>
            </div>
          }
          searchKeys={["numero", "cliente_nombre"]}
          pageSize={10}
        />
        
        {facturas.length > 0 && footerTotales}
      </div>

      {/* Modal de cobro unificado */}
      <CobroModalUnificado
        key={facturaSeleccionada?.id ?? 0}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFacturaSeleccionada(null);
        }}
        onPagoOk={handlePagoOk}
        factura={facturaSeleccionada}
      />
    </div>
  );
}