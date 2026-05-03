import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClientesPage from "../pages/Clientes/ClientesPage";
import ClienteFormPage from "../pages/Clientes/ClienteFormPage";
import CotizacionesPage from "../pages/Cotizaciones/CotizacionesPage";
import CotizacionFormPage from "../pages/Cotizaciones/CotizacionFormPage";
import CotizacionViewPage from "../pages/Cotizaciones/CotizacionViewPage";
import FacturasPage from "../pages/Facturas/FacturasPage";
import FacturaFormPage from "../pages/Facturas/FacturaFormPage";
import FacturaViewPage from "../pages/Facturas/FacturaViewPage";
import FinanzasPage from "../pages/Finanzas/FinanzasPage";
import FinanzasPendientesPage from "../pages/Finanzas/FinanzasPendientesPage";
import FinanzasCobroFactura from "../pages/Finanzas/FinanzasCobroFactura";
import ProveedoresPage from "../pages/Proveedores/ProveedoresPage";
import ProveedorFormPage from "../pages/Proveedores/ProveedorFormPage";
import VentaRapidaPage from "../pages/VentaRapida/VentaRapidaPage";
import IngresosPage from "../pages/Finanzas/IngresosPage";
import ReportesPage from "../pages/Reportes/ReportesPage";
import UsuariosPage from "../pages/Ajustes/UsuariosPage";
import EgresosPage from "../pages/Finanzas/EgresosPage";
import EmpresaFormPage from "../pages/Empresa/EmpresaFormPage";
import UsuarioFormPage from "../pages/Ajustes/UsuarioFormPage";
import BrevoPage from "../pages/Ajustes/BrevoPage";
import ClienteFacturasPage from "../pages/Clientes/ClienteFacturasPage";

import AuditoriaPage from "../pages/Ajustes/AuditoriaPage";

import CatalogoPage from "../pages/Catalogo/CatalogoPage";
import CatalogoFormPage from "../pages/Catalogo/CatalogoFormPage";

import ComprasPage from "../pages/Compras/ComprasPage";
import MovimientosPage from "../pages/Inventario/MovimientosPage";

import EmpresaPage from "../pages/Empresa/EmpresaPage";

function PublicRoute({ children }) {
    const { token } = useAuth();
    return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Clientes */}
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="clientes/nuevo" element={<ClienteFormPage />} />
                <Route path="clientes/editar/:id" element={<ClienteFormPage />} />
                <Route path="finanzas/ingresos" element={<IngresosPage />} />
<Route path="empresas/nueva" element={<EmpresaFormPage />} />

                {/* Cotizaciones */}
                <Route path="cotizaciones" element={<CotizacionesPage />} />
                <Route path="cotizaciones/nueva" element={<CotizacionFormPage />} />
                <Route path="cotizaciones/editar/:id" element={<CotizacionFormPage />} />
                <Route path="cotizaciones/ver/:id" element={<CotizacionViewPage />} />
                <Route path="ajustes/brevo" element={<BrevoPage />} />

                <Route path="reportes" element={<ReportesPage />} />
<Route path="clientes/facturas/:id" element={<ClienteFacturasPage />} />
                <Route path="empresa" element={<EmpresaPage />} />
                <Route path="ajustes/usuarios" element={<UsuariosPage />} />
                {/* Facturas */}
                <Route path="facturas" element={<FacturasPage />} />
                <Route path="facturas/nueva" element={<FacturaFormPage />} />
                <Route path="facturas/editar/:id" element={<FacturaFormPage />} />
                <Route path="facturas/ver/:id" element={<FacturaViewPage />} />

                <Route path="finanzas/egresos" element={<EgresosPage />} />

                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="proveedores/nuevo" element={<ProveedorFormPage />} />
                <Route path="proveedores/editar/:id" element={<ProveedorFormPage />} />

                <Route path="catalogo" element={<CatalogoPage />} />
                <Route path="catalogo/nuevo" element={<CatalogoFormPage />} />
                <Route path="catalogo/editar/:id" element={<CatalogoFormPage />} />

                {/* Finanzas - Rutas actualizadas */}
                <Route path="finanzas" element={<FinanzasPage />} />
                <Route path="finanzas/pendientes" element={<FinanzasPendientesPage />} />
                <Route path="finanzas/cobro-rapido" element={<FinanzasCobroFactura />} /> {/* 👈 NUEVA RUTA */}

                <Route path="compras" element={<ComprasPage />} />
                <Route path="inventario/movimientos" element={<MovimientosPage />} />

                <Route path="ajustes/usuarios" element={<UsuariosPage />} />
                <Route path="ajustes/usuario-form" element={<UsuarioFormPage />} />
                <Route path="ajustes/usuario-form/:id" element={<UsuarioFormPage />} />

                <Route path="ajustes/auditoria" element={<AuditoriaPage />} />
                <Route path="venta-rapida" element={<VentaRapidaPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}