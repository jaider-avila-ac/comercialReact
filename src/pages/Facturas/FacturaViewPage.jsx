import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerFactura } from "../../services/facturas.service";
import { obtenerEmpresa, obtenerLogoUrl, revocarLogoUrl } from "../../services/empresa.service";
import { formatMoney } from "../../services/dashboard.service";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { ArrowLeft, Pencil, Printer, AlertTriangle, Loader2 } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.substring(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const ESTADO_STYLE = {
  BORRADOR: "bg-gray-100 text-gray-700",
  EMITIDA: "bg-green-100 text-green-800",
  PAGADA: "bg-blue-100 text-blue-800",
  ANULADA: "bg-red-100 text-red-800",
};

export default function FacturaViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const blobRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      obtenerFactura(id),
      obtenerEmpresa().catch(() => null),
    ])
      .then(([fac, emp]) => {
        if (cancelled) return;
        setData(fac);
        setEmpresa(emp);
        if (emp?.logo_path) return obtenerLogoUrl();
      })
      .then(url => {
        if (cancelled || !url) return;
        if (blobRef.current) revocarLogoUrl(blobRef.current);
        blobRef.current = url;
        setLogoUrl(url);
      })
      .catch(e => { if (!cancelled) console.error(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      if (blobRef.current) { revocarLogoUrl(blobRef.current); blobRef.current = null; }
    };
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-blue-600">
      <Loader2 className="w-10 h-10 animate-spin" />
      <p className="mt-2 font-medium">Cargando factura...</p>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-100">
      <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
      <p className="mt-2 text-gray-600 font-semibold">No se encontró la factura</p>
      <Button text="Volver" icon={ArrowLeft} onClick={() => navigate(-1)} className="mt-4" />
    </div>
  );

  const emp = empresa ?? {};
  const { cliente: cli = {}, usuario: usr = {}, lineas = [] } = data;
  const saldo = parseFloat(data.saldo) || 0;
  const totalPagado = parseFloat(data.total_pagado) || 0;
  const canEdit = data.estado === "BORRADOR" || data.estado === "EMITIDA";

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      {/* Toolbar — oculto al imprimir */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border d-print-none">
        <div className="flex gap-2">
          <IconButton icon={ArrowLeft} onClick={() => navigate("/facturas")} title="Volver" />
          {canEdit && (
            <IconButton icon={Pencil} onClick={() => navigate(`/facturas/editar/${id}`)} variant="warning" title="Editar" />
          )}
        </div>
        <Button text="Imprimir / PDF" icon={Printer} onClick={() => window.print()} variant="primary" />
      </div>

      {/* Hoja de Factura */}
      <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-200 print:shadow-none print:border-none">

        {/* Cabecera */}
        <div className="flex justify-between border-b-4 border-blue-600 pb-6 mb-8">
          <div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo empresa" className="h-16 w-auto object-contain mb-3" />
            )}

              {/*    <h1 className="text-2xl font-bold text-blue-700 uppercase">{emp.nombre || "SYS Comercial"}</h1>*/}
         
            <div className="text-sm text-gray-500">
              <p>NIT: {emp.nit}</p>
              <p>{emp.direccion}</p>
              <p>{emp.telefono} · {emp.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-gray-400 font-bold tracking-widest uppercase">Factura</h2>
            {data.numero && (
              <p className="text-4xl font-black text-blue-600">{data.numero}</p>
            )}
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${ESTADO_STYLE[data.estado] || "bg-gray-100 text-gray-700"}`}>
              {data.estado}
            </span>
          </div>
        </div>

        {/* Cliente y Fechas */}
        <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100 text-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Cliente</p>
            <p className="font-bold text-gray-800 text-base">{cli.nombre_razon_social}</p>
            <p className="text-gray-600">{cli.tipo_documento}: {cli.num_documento}</p>
            <p className="text-gray-600">{cli.direccion}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Emisión</p>
              <p className="font-semibold text-gray-700">{formatDate(data.fecha)}</p>
            </div>
            {data.fecha_vencimiento && (
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Vencimiento</p>
                <p className="font-semibold text-gray-700">{formatDate(data.fecha_vencimiento)}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Vendedor</p>
              <p className="font-semibold text-gray-700">{usr.nombres} {usr.apellidos}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Ítems */}
        <table className="w-full text-left text-sm mb-8">
          <thead className="bg-blue-600 text-white uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Descripción</th>
              <th className="px-4 py-3 text-right">Cant.</th>
              <th className="px-4 py-3 text-right">Valor Unit.</th>
              <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lineas.map((l, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-gray-700 font-medium">
                  {l.descripcion_manual || l.item?.nombre}
                </td>
                <td className="px-4 py-4 text-right text-gray-600">{l.cantidad}</td>
                <td className="px-4 py-4 text-right text-gray-600">{formatMoney(l.valor_unitario)}</td>
                <td className="px-4 py-4 text-right font-bold text-gray-800">{formatMoney(l.total_linea)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 border-t-2 border-blue-100 pt-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>{formatMoney(data.subtotal)}</span>
            </div>
            {parseFloat(data.total_descuentos) > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Descuentos:</span>
                <span>-{formatMoney(data.total_descuentos)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>IVA:</span>
              <span>{formatMoney(data.total_iva)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-blue-700 pt-2 border-t border-gray-200">
              <span>TOTAL:</span>
              <span>{formatMoney(data.total)}</span>
            </div>
            {data.estado !== "BORRADOR" && (
              <>
                <div className="flex justify-between text-green-600 font-semibold pt-2 border-t border-gray-200">
                  <span>Pagado:</span>
                  <span>{formatMoney(totalPagado)}</span>
                </div>
                <div className={`flex justify-between font-bold ${saldo > 0 ? "text-red-600" : "text-green-600"}`}>
                  <span>Saldo pendiente:</span>
                  <span>{formatMoney(saldo)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notas */}
        {data.notas && (
          <div className="mt-10 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-gray-600 italic">
            <strong>Notas: </strong>{data.notas}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Documento generado por {emp.nombre || "SYS Comercial"}
        </footer>
      </div>
    </div>
  );
}
