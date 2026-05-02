import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Paperclip, Calculator, Info } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { obtenerItem, crearItem, actualizarItem, eliminarItem } from "../../services/catalogo.service";
import { apiFetch } from "../../services/api";
import { showToast, showConfirm } from "../../utils/notifications";
import { obtenerDashboard } from "../../services/dashboard.service";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export default function CatalogoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [proveedorSearch, setProveedorSearch] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [archivoNombre, setArchivoNombre] = useState("Sin archivo");
  const [archivo, setArchivo] = useState(null);
  const [cajaDisponible, setCajaDisponible] = useState(null);

  const proveedorTimerRef = useRef(null);
  const proveedorInputRef = useRef(null);
  const proveedorDropdownRef = useRef(null);
  const archivoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    tipo: "PRODUCTO",
    nombre: "",
    descripcion: "",
    precio_compra: "",
    precio_venta_sugerido: "",
    controla_inventario: false,
    stock_minimo: "",
    cantidad_inicial: "",
    is_activo: true,
    condicion_pago: "CONTADO",
    abono_inicial: "",
    proveedor_id: null,
  });

  useEffect(() => {
    obtenerDashboard()
      .then(data => setCajaDisponible(data.resumen?.total_en_caja ?? 0))
      .catch(() => setCajaDisponible(null));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    obtenerItem(id)
      .then(data => {
        if (cancelled) return;
        const inventario = data.inventario || {};
        setFormData({
          tipo: data.tipo || "PRODUCTO",
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          precio_compra: data.precio_compra || "",
          precio_venta_sugerido: data.precio_venta_sugerido || "",
          controla_inventario: data.controla_inventario || false,
          stock_minimo: inventario.unidades_minimas || "",
          cantidad_inicial: inventario.unidades_actuales || "",
          is_activo: data.is_activo ?? true,
          condicion_pago: "CONTADO",
          abono_inicial: "",
          proveedor_id: data.proveedor_id || null,
        });
        if (data.proveedor_id && data.proveedor) {
          setProveedorId(data.proveedor_id);
          setProveedorSearch(data.proveedor.nombre);
          if (proveedorInputRef.current) {
            proveedorInputRef.current.disabled = true;
          }
        }
      })
      .catch(() => { if (!cancelled) showToast("Error al cargar el item", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEditing]);

  const showDropdown = (items) => {
    if (!proveedorDropdownRef.current) return;

    proveedorDropdownRef.current.innerHTML = "";
    if (!items.length) {
      const div = document.createElement("div");
      div.className = "px-3 py-2 text-gray-400 text-sm";
      div.textContent = "Sin resultados.";
      proveedorDropdownRef.current.appendChild(div);
    } else {
      items.forEach(p => {
        const div = document.createElement("div");
        div.className = "px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm";
        div.textContent = p._label;
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          selectProveedor(p);
        });
        proveedorDropdownRef.current.appendChild(div);
      });
    }
    proveedorDropdownRef.current.style.display = "block";
  };

  const hideDropdown = () => {
    if (proveedorDropdownRef.current) {
      proveedorDropdownRef.current.style.display = "none";
    }
  };

  const selectProveedor = (proveedor) => {
    setProveedorId(proveedor.id);
    setProveedorSearch(proveedor._label);
    setFormData(prev => ({ ...prev, proveedor_id: proveedor.id }));
    hideDropdown();
    if (proveedorInputRef.current) {
      proveedorInputRef.current.disabled = true;
    }
  };

  const clearProveedor = () => {
    setProveedorId("");
    setProveedorSearch("");
    setFormData(prev => ({ ...prev, proveedor_id: null }));
    if (proveedorInputRef.current) {
      proveedorInputRef.current.disabled = false;
      proveedorInputRef.current.value = "";
      proveedorInputRef.current.focus();
    }
    hideDropdown();
  };

  const buscarProveedores = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      hideDropdown();
      return;
    }
    try {
      const res = await apiFetch(`/proveedores?search=${encodeURIComponent(searchTerm)}&activos=1&page=1`);
      const data = await res.json();
      const items = (data.data || []).map(p => ({
        ...p,
        _label: `${p.nombre}${p.nit ? " · " + p.nit : ""}`
      }));
      showDropdown(items);
    } catch (err) {
      console.error("Error buscando proveedores:", err);
      showDropdown([]);
    }
  };

  const handleProveedorInput = (e) => {
    if (proveedorInputRef.current?.disabled) return;

    const value = e.target.value;
    setProveedorSearch(value);
    setProveedorId("");
    setFormData(prev => ({ ...prev, proveedor_id: null }));

    if (proveedorTimerRef.current) {
      clearTimeout(proveedorTimerRef.current);
    }
    proveedorTimerRef.current = setTimeout(() => {
      buscarProveedores(value);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (proveedorInputRef.current && !proveedorInputRef.current.contains(e.target) &&
          proveedorDropdownRef.current && !proveedorDropdownRef.current.contains(e.target)) {
        hideDropdown();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (proveedorInputRef.current && !proveedorId) {
      proveedorInputRef.current.disabled = false;
    }
  }, [proveedorId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "condicion_pago" && value === "CONTADO" && (cajaDisponible ?? 0) <= 0) {
      showToast("No hay saldo disponible en caja para registrar un pago de contado.", "warning");
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setArchivoNombre(file.name);
    } else {
      setArchivo(null);
      setArchivoNombre("Sin archivo");
    }
  };

  const tieneDecimales = (valor) => {
    if (valor === "" || valor === null) return false;
    return !Number.isInteger(Number(valor));
  };

  const validarEnteros = () => {
    if (!formData.controla_inventario) return true;

    const errores = [];
    if (formData.stock_minimo && tieneDecimales(formData.stock_minimo)) {
      errores.push("Stock mínimo");
    }
    if (formData.cantidad_inicial && tieneDecimales(formData.cantidad_inicial)) {
      errores.push(isEditing ? "Stock actual" : "Cantidad inicial");
    }

    if (errores.length) {
      showToast(`${errores.join(" y ")} debe ser entero (sin decimales)`, "error");
      return false;
    }
    return true;
  };

  const calcularCostoEstimado = () => {
    if (!formData.controla_inventario) return 0;
    const cant = parseInt(formData.cantidad_inicial) || 0;
    const prec = parseFloat(formData.precio_compra) || 0;
    return cant * prec;
  };

  const debeMostrarSeccionPago = () => {
    if (isEditing) return false;
    const ctrl = formData.controla_inventario;
    const cant = parseInt(formData.cantidad_inicial) || 0;
    const prec = parseFloat(formData.precio_compra) || 0;
    return ctrl && cant > 0 && prec > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      showToast("El nombre es obligatorio", "error");
      return;
    }

    if (formData.controla_inventario && formData.stock_minimo && tieneDecimales(formData.stock_minimo)) {
      showToast("El stock mínimo debe ser un número entero", "error");
      return;
    }

    if (!validarEnteros()) return;

    setSaving(true);
    try {
      if (isEditing) {
        const payload = {
          tipo: formData.tipo,
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra) : null,
          precio_venta_sugerido: formData.precio_venta_sugerido ? parseFloat(formData.precio_venta_sugerido) : null,
          controla_inventario: formData.controla_inventario,
          is_activo: formData.is_activo,
          proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
        };
        if (formData.controla_inventario) {
          if (formData.stock_minimo) payload.unidades_minimas = Math.round(Number(formData.stock_minimo));
          if (formData.cantidad_inicial) payload.cantidad_actual = Math.round(Number(formData.cantidad_inicial));
        }
        await actualizarItem(id, payload);
        showToast("Item actualizado correctamente", "success");
        navigate("/catalogo");
      } else {
        const formDataObj = new FormData();
        formDataObj.append("tipo", formData.tipo);
        formDataObj.append("nombre", formData.nombre);
        if (formData.descripcion) formDataObj.append("descripcion", formData.descripcion);
        if (formData.precio_compra) formDataObj.append("precio_compra", parseFloat(formData.precio_compra));
        if (formData.precio_venta_sugerido) formDataObj.append("precio_venta_sugerido", parseFloat(formData.precio_venta_sugerido));
        formDataObj.append("controla_inventario", formData.controla_inventario ? "1" : "0");
        formDataObj.append("is_activo", formData.is_activo ? "1" : "0");
        if (formData.proveedor_id) formDataObj.append("proveedor_id", formData.proveedor_id);

        if (formData.controla_inventario) {
          if (formData.stock_minimo) formDataObj.append("unidades_minimas", Math.round(Number(formData.stock_minimo)));
          const cantInicial = Math.round(Number(formData.cantidad_inicial) || 0);
          if (cantInicial > 0) formDataObj.append("cantidad_inicial", cantInicial);

          const costoTotal = calcularCostoEstimado();
          if (costoTotal > 0) {
            formDataObj.append("condicion_pago", formData.condicion_pago);
            if (formData.condicion_pago === "CREDITO" && formData.abono_inicial) {
              formDataObj.append("abono_inicial", parseFloat(formData.abono_inicial));
            }
            if (archivo && formData.condicion_pago !== "LIBRE") {
              formDataObj.append("archivo", archivo);
            }
          }
        }

        await crearItem(formDataObj);
        showToast("Item creado correctamente", "success");
        navigate("/catalogo");
      }
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm("¿Desactivar este item?", {
      title: "Desactivar item",
      okLabel: "Sí, desactivar",
    });
    if (!confirmed) return;

    try {
      await eliminarItem(id);
      showToast("Item desactivado correctamente", "success");
      setTimeout(() => navigate("/catalogo"), 600);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const costoEstimado = calcularCostoEstimado();
  const mostrarSeccionPago = debeMostrarSeccionPago();
  const isCredito = formData.condicion_pago === "CREDITO";
  const isLibre = formData.condicion_pago === "LIBRE";

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? `Editar item #${id}` : "Nuevo item"}
        </h1>
        <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate("/catalogo")} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="PRODUCTO">PRODUCTO</option>
                <option value="INSUMO">INSUMO</option>
                <option value="SERVICIO">SERVICIO</option>
              </select>
            </div>

            {/* Nombre */}
            <div>
              <Input
                name="nombre"
                label="Nombre *"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre del item"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del item..."
              />
            </div>

            {/* Precio compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio compra <span className="text-gray-400 text-xs">(costo unitario)</span>
              </label>
              <input
                type="number"
                name="precio_compra"
                value={formData.precio_compra}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Precio venta sugerido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta sugerido</label>
              <input
                type="number"
                name="precio_venta_sugerido"
                value={formData.precio_venta_sugerido}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Proveedor - Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor habitual <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <input
                  ref={proveedorInputRef}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${proveedorId ? "bg-gray-100" : ""}`}
                  value={proveedorSearch}
                  onChange={handleProveedorInput}
                  placeholder="Buscar proveedor..."
                  disabled={!!proveedorId}
                  autoComplete="off"
                />
                <div
                  ref={proveedorDropdownRef}
                  className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
                  style={{ display: "none" }}
                />
              </div>
              {proveedorId && (
                <button
                  type="button"
                  onClick={clearProveedor}
                  className="text-xs text-blue-600 mt-1 hover:text-blue-700"
                >
                  Cambiar proveedor
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">Solo para dejar una referencia del proveedor más frecuente.</p>
            </div>

            {/* Controla inventario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controla inventario</label>
              <select
                name="controla_inventario"
                value={formData.controla_inventario ? "1" : "0"}
                onChange={(e) => setFormData(prev => ({ ...prev, controla_inventario: e.target.value === "1" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </div>

            {/* Stock mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input
                type="number"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                step="1"
                min="0"
                disabled={!formData.controla_inventario}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="0"
              />
            </div>

            {/* Cantidad inicial / Stock actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? "Stock actual" : "Cantidad inicial"}
              </label>
              <input
                type="number"
                name="cantidad_inicial"
                value={formData.cantidad_inicial}
                onChange={handleChange}
                step="1"
                min="0"
                disabled={!formData.controla_inventario}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="0"
              />
            </div>

            {/* Activo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
              <select
                name="is_activo"
                value={formData.is_activo ? "1" : "0"}
                onChange={(e) => setFormData(prev => ({ ...prev, is_activo: e.target.value === "1" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>

          {/* Sección de pago del stock inicial */}
          {!isEditing && mostrarSeccionPago && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calculator size={16} className="text-blue-500" />
                Pago del stock inicial
              </h3>

              {/* Costo estimado */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center gap-3">
                <Calculator className="text-blue-500 flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Costo estimado del stock inicial</p>
                  <p className="text-xl font-bold text-gray-800">{formatMoney(costoEstimado)}</p>
                  <p className="text-xs text-gray-400">
                    {formData.cantidad_inicial} uds. × {formatMoney(parseFloat(formData.precio_compra) || 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Condición de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Cómo se pagó? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="condicion_pago"
                    value={formData.condicion_pago}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CONTADO">Contado — descuenta del saldo ahora</option>
                    <option value="CREDITO">A crédito — lo pagaré después</option>
                    <option value="LIBRE">Libre — solo registro, no afecta caja</option>
                  </select>
                </div>

                {/* Abono inicial (solo para crédito) */}
                {isCredito && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Abono inicial <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      name="abono_inicial"
                      value={formData.abono_inicial}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">Si pagaste una parte ahora y el resto queda a crédito.</p>
                  </div>
                )}

                {/* Archivo adjunto (solo para no libre) */}
                {!isLibre && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soporte del pago <span className="text-gray-400 text-xs">(factura, foto o PDF — opcional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => archivoInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Paperclip size={14} />
                        Adjuntar archivo
                      </button>
                      <span className="text-sm text-gray-500">{archivoNombre}</span>
                      <input
                        ref={archivoInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">PDF o imagen, máx. 5 MB.</p>
                  </div>
                )}
              </div>

              {/* Avisos */}
              {isCredito && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Pago a crédito:</strong> se creará una compra pendiente por pagar.
                    Los abonos se registran después desde Compras, y cada pago generará automáticamente su egreso con soporte.
                  </p>
                </div>
              )}
              {isLibre && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm text-blue-800">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Registro libre:</strong> solo se registra el item y el inventario,
                    no se afecta la caja ni se crea compra/egreso.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500" id="msg"></div>
            <div className="flex gap-3">
              {isEditing && (
                <Button
                  type="button"
                  text="Desactivar"
                  icon={Trash2}
                  variant="danger"
                  onClick={handleDelete}
                />
              )}
              <Button
                type="submit"
                text={saving ? "Guardando..." : "Guardar"}
                icon={Save}
                variant="primary"
                disabled={saving}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
