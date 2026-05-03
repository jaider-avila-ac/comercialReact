// src/pages/Clientes/ClienteFacturasPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";
import { obtenerCliente } from "../../services/clientes.service";
import { listarFacturas } from "../../services/facturas.service";
import { showToast } from "../../utils/notifications";
import { formatMoney } from "../../services/dashboard.service";

export default function ClienteFacturasPage() {
  const { id } = useParams();
  const isMountedRef = useRef(true);
  const [cliente, setCliente] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [totales, setTotales] = useState({
    totalFacturado: 0,
    totalPagado: 0,
    totalSaldo: 0,
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const resCliente = await obtenerCliente(id);
      const clienteData = resCliente;
      if (!isMountedRef.current) return;
      setCliente(clienteData);

      // Cargar facturas del cliente
      const resFacturas = await listarFacturas({ cliente_id: id });
      const facturasData = resFacturas.data || [];

      let totalFacturado = 0;
      let totalPagado = 0;
      let totalSaldo = 0;

      const facturasMapped = facturasData.map(f => {
        const total = parseFloat(f.total) || 0;
        const pagado = parseFloat(f.total_pagado) || 0;
        const saldo = parseFloat(f.saldo) || (total - pagado);

        totalFacturado += total;
        totalPagado += pagado;
        totalSaldo += saldo;

        return {
          id: f.id,
          numero: f.numero || `#${f.id}`,
          fecha: f.fecha?.substring(0, 10) || "—",
          total: formatMoney(total),
          total_raw: total,
          pagado: formatMoney(pagado),
          pagado_raw: pagado,
          saldo: formatMoney(saldo),
          saldo_raw: saldo,
          estado: f.estado,
          cliente_id: f.cliente_id,
        };
      });

      setFacturas(facturasMapped);
      setTotales({
        totalFacturado: formatMoney(totalFacturado),
        totalPagado: formatMoney(totalPagado),
        totalSaldo: formatMoney(totalSaldo),
      });
    } catch (error) {
      showToast(error.message || "Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const run = async () => { await loadData(); };
    run();
  }, [loadData]);

  const handleCobrar = (row) => {
    const factura = facturas.find(f => f.id === row.id);
    if (factura && (factura.saldo_raw > 0 || factura.estado === "EMITIDA")) {
      setFacturaSeleccionada(factura);
      setModalOpen(true);
    }
  };

  const handlePagoOk = async () => {
    await loadData();
  };

  const columns = [
    { key: "numero", label: "N° Factura", sortable: true },
    { key: "fecha", label: "Fecha", sortable: true },
    { key: "total", label: "Total", align: "right", sortable: true },
    { key: "pagado", label: "Pagado", align: "right", sortable: true },
    { key: "saldo", label: "Saldo", align: "right", sortable: true },
    {
      key: "estado",
      label: "Estado",
      align: "center",
      render: (val, row) => {
        if (val === "ANULADA") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">ANULADA</span>;
        if (val === "BORRADOR") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">BORRADOR</span>;
        if (row.saldo_raw <= 0 && val === "EMITIDA") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">PAGADA</span>;
        if (val === "EMITIDA" && row.saldo_raw > 0) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">PARCIAL</span>;
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{val}</span>;
      },
    },
  ];

  const actions = (row) => {
    const factura = facturas.find(f => f.id === row.id);
    const mostrarBotonPagar = factura?.estado === "EMITIDA" && factura?.saldo_raw > 0;
    
    return (
      <div className="flex gap-1 justify-center">
        {mostrarBotonPagar && (
          <button
            onClick={() => handleCobrar(row)}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
            title="Registrar pago"
          >
            <DollarSign size={14} /> Pagar
          </button>
        )}
        <Link
          to={`/facturas/ver/${row.id}?return_to=cliente&cliente_id=${id}`}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
          title="Ver detalle"
        >
          <i className="bi bi-eye"></i> Ver
        </Link>
      </div>
    );
  };

  const rows = facturas.map(f => ({
    id: f.id,
    numero: (
      <Link to={`/facturas/ver/${f.id}?return_to=cliente&cliente_id=${id}`} className="text-blue-600 hover:underline font-semibold">
        {f.numero}
      </Link>
    ),
    fecha: f.fecha,
    total: <span className="font-semibold">{f.total}</span>,
    pagado: <span className="text-green-600 font-semibold">{f.pagado}</span>,
    saldo: <span className={`font-semibold ${f.saldo_raw > 0 ? "text-red-600" : "text-green-600"}`}>{f.saldo}</span>,
    estado: f.estado,
    saldo_raw: f.saldo_raw,
  }));

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Cargando datos del cliente...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-person-badge text-blue-500"></i>
            Facturas del Cliente
          </h1>
          <p className="text-sm text-gray-500" id="clienteInfo">
            {cliente ? (
              <>
                <strong>{cliente.nombre_razon_social}</strong>
                {cliente.num_documento && ` · ${cliente.tipo_documento || "Doc"}: ${cliente.num_documento}`}
                {cliente.email && ` · ${cliente.email}`}
                {cliente.telefono && ` · Tel: ${cliente.telefono}`}
              </>
            ) : (
              "Cargando información del cliente..."
            )}
          </p>
        </div>
        <Link to="/clientes">
          <Button text="Volver a clientes" icon={ArrowLeft} variant="outline" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Facturado</div>
          <div className="text-xl font-bold text-blue-600">{totales.totalFacturado}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Pagado</div>
          <div className="text-xl font-bold text-green-600">{totales.totalPagado}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Saldo Pendiente Total</div>
          <div className="text-xl font-bold text-red-600">{totales.totalSaldo}</div>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <i className="bi bi-receipt"></i>
            Facturas del Cliente
          </h3>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          actions={actions}
          loading={loading}
          empty="No hay facturas para este cliente"
          pageSize={10}
        />
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