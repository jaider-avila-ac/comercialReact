import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell, Menu } from "lucide-react";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/proveedores": "Proveedores",
  "/cotizaciones": "Cotizaciones",
  "/facturas": "Facturas",
  "/finanzas": "Finanzas",
  "/reportes": "Reportes",
  "/catalogo": "Catálogo",
  "/empresa": "Empresa",
  "/ajustes/usuarios": "Ajustes / Usuarios",
  "/ajustes/empresas": "Ajustes / Empresas",
  "/ajustes/brevo": "Ajustes / Brevo",
};

function getTitle(pathname) {
  // Si es una ruta de ajustes, devolver el título específico
  if (pathname.startsWith("/ajustes")) {
    return ROUTE_TITLES[pathname] || "Ajustes";
  }
  return ROUTE_TITLES[pathname] || "SYS Comercial";
}

const rolColors = {
  SUPER_ADMIN: "bg-red-500",
  EMPRESA_ADMIN: "bg-blue-500",
  OPERATIVO: "bg-gray-500",
};

export default function TopBar({ onMenuClick }) {
  const { perfil } = useAuth();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nombre = perfil
    ? `${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim() || perfil.email || "Usuario"
    : "Usuario";
  const inicial = nombre.charAt(0).toUpperCase();
  const rol = perfil?.rol || "USUARIO";
  const avatarColor = rolColors[rol] || "bg-gray-500";

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 flex items-center px-4 bg-white border-b border-gray-200 shadow-sm">
      <button 
        onClick={onMenuClick} 
        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors mr-2"
      >
        <Menu size={20} />
      </button>

      <span className="text-lg font-bold text-gray-800 ml-2 lg:ml-0">
        {getTitle(pathname)}
      </span>

      <div className="ml-auto flex items-center gap-4">
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {inicial}
          </div>
          {!isMobile && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-800">{nombre}</div>
              <div className="text-xs text-gray-400">{rol.replace("_", " ")}</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}