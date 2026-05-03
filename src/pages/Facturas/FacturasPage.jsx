import { Link } from "react-router-dom";
import { Plus, Pencil, Eye, Send, XCircle, Search } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { useFacturas } from "../../hooks/useFacturas";
import { formatMoney } from "../../services/dashboard.service";

const COLUMNS = [
  { key: "numero", label: "Número", sortable: true },
  { key: "cliente_nombre", label: "Cliente", sortable: true },
  { key: "estado_badge", label: "Estado", sortable: true },
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "total_formateado", label: "Total", sortable: true, align: "right" },
];

const ESTADO_STYLES = {
  BORRADOR: "bg-gray-100 text-gray-600",
  EMITIDA: "bg-emerald-100 text-emerald-600",
  ANULADA: "bg-red-100 text-red-600",
};

export default function FacturasPage() {
  const {
    facturas, loading, error,
    search, setSearch,
    estado, setEstado,
    handleEmitir, handleAnular,
    reload,
  } = useFacturas();

  const renderEstado = (e) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[e] || ESTADO_STYLES.BORRADOR}`}>
      {e}
    </span>
  );

  const rows = facturas.map(f => ({
    id: f.id,
    numero: f.estado === "BORRADOR" ? (
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Borrador</span>
    ) : f.estado === "ANULADA" && !f.numero ? (
      <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Anulada</span>
    ) : (
      <span className="font-mono font-medium text-blue-600">{f.numero || `#${f.id}`}</span>
    ),
    cliente_nombre: <div className="font-semibold text-gray-800">{f.cliente?.nombre_razon_social || "—"}</div>,
    estado_badge: renderEstado(f.estado),
    fecha: f.fecha?.substring(0, 10) || "—",
    total_formateado: <span className="font-semibold text-gray-900">{formatMoney(f.total)}</span>,
    estado_raw: f.estado,
    numero_raw: f.numero,
  }));

  const renderAcciones = (row) => {
    const isBorrador = row.estado_raw === "BORRADOR";
    return (
      <div className="flex items-center gap-1">
        <Link to={`/facturas/ver/${row.id}`}>
          <IconButton icon={Eye} title="Ver" variant="info" />
        </Link>
        {isBorrador && (
          <>
            <Link to={`/facturas/editar/${row.id}`}>
              <IconButton icon={Pencil} title="Editar" variant="warning" />
            </Link>
            <IconButton
              icon={Send}
              title="Emitir"
              variant="success"
              onClick={() => handleEmitir(row.id)}
            />
          </>
        )}
        {row.estado_raw !== "ANULADA" && (
          <IconButton
            icon={XCircle}
            title="Anular"
            variant="danger"
            onClick={() => handleAnular(row.id)}
          />
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <XCircle className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-semibold mt-2">Error al cargar facturas</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Facturas</h2>
          <p className="text-sm text-gray-400">Gestión de facturas de venta</p>
        </div>
        <Link
          to="/facturas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} /> Nueva factura
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EMITIDA">Emitida</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200" style={{ height: 600 }}>
        <div className="p-3 flex flex-col h-full">
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay facturas registradas."
            defaultSort={{ key: "fecha", dir: "desc" }}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
