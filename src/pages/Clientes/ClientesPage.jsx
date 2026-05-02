import { Link } from "react-router-dom";
import { Plus, CreditCard, Pencil, Trash2, Search } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useClientes } from "./useClientes";
import { showConfirm, showToast } from "../../utils/notifications";
import { formatMoney } from "../../services/dashboard.service";

const COLUMNS = [
  { key: "nombre_completo", label: "Cliente", sortable: true },
  { key: "documento", label: "Documento", sortable: true },
  { key: "telefono", label: "Teléfono", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "saldo_formateado", label: "Saldo a favor", sortable: true, align: "right" },
];

export default function ClientesPage() {
  const { 
    clientes, 
    loading, 
    error, 
    pagination,
    search,
    setSearch,
    handleDelete, 
    changePage,
    reload 
  } = useClientes();

  const formatSaldo = (saldo) => {
    const saldoNum = saldo || 0;
    if (saldoNum > 0) {
      return <span className="text-emerald-600 font-semibold">{formatMoney(saldoNum)}</span>;
    }
    return <span className="text-gray-400">—</span>;
  };

  const onDelete = async (row) => {
    const confirmed = await showConfirm(
      `¿Eliminar a <strong>${row.nombre_razon_social}</strong>? Esta acción no se puede deshacer.`,
      { title: "Eliminar cliente", okLabel: "Sí, eliminar" }
    );
    if (confirmed) {
      const result = await handleDelete(row.id, row.nombre_razon_social);
      if (result.success) {
        showToast("Cliente eliminado correctamente", "success");
      }
    }
  };

  const rows = clientes.map(c => ({
    id: c.id,
    nombre_completo: (
      <div>
        <div className="font-semibold text-gray-800">{c.nombre_razon_social}</div>
        {c.empresa && <div className="text-xs text-gray-400">{c.empresa}</div>}
      </div>
    ),
    documento: c.tipo_documento && c.num_documento 
      ? `${c.tipo_documento} ${c.num_documento}`
      : "—",
    telefono: c.telefono || "—",
    email: c.email || "—",
    saldo_formateado: formatSaldo(c.saldo_a_favor),
    nombre_razon_social: c.nombre_razon_social,
  }));

  const renderAcciones = (row) => (
    <div className="flex items-center gap-1">
      <Link to={`/clientes/facturas/${row.id}`}>
        <IconButton icon={CreditCard} title="Ver facturas" variant="info" />
      </Link>
      <Link to={`/clientes/editar/${row.id}`}>
        <IconButton icon={Pencil} title="Editar" variant="warning" />
      </Link>
      <IconButton 
        icon={Trash2} 
        title="Eliminar" 
        variant="danger"
        onClick={() => onDelete({ id: row.id, nombre_razon_social: row.nombre_razon_social })} 
      />
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-semibold mt-2">Error al cargar clientes</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
          <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
          <p className="text-sm text-gray-400">Gestión de clientes del sistema</p>
        </div>
        <Link
          to="/clientes/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} /> Nuevo cliente
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabla - altura fija con scroll */}
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay clientes registrados."
            defaultSort={{ key: "nombre_completo", dir: "asc" }}
            searchKeys={[]}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
        
        {/* Paginación - SIEMPRE visible, fuera del área de carga */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          {pagination.total > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.lastPage}
              onPageChange={changePage}
              totalItems={pagination.total}
              pageSize={pagination.perPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}