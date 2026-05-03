import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validarCorreo, validarPassword, setUser } from "../../services/auth.service";
import {
  Building2, Mail, Lock, Eye, EyeOff, ArrowLeft,
  Loader2, BarChart2, Users, FileText, ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { icon: BarChart2, text: "Dashboard y reportes en tiempo real" },
  { icon: FileText,  text: "Facturación y cotizaciones" },
  { icon: Users,     text: "Gestión multiempresa" },
  { icon: ShieldCheck, text: "Acceso seguro por roles" },
];

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [step, setStep]               = useState("correo");
  const [correo, setCorreo]           = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  async function handleCorreo(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await validarCorreo(correo);
      setSessionToken(resp.sessionToken);
      setStep("password");
      setPassword("");
    } catch (err) {
      setError(err?.message ?? "Correo no encontrado.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await validarPassword(sessionToken, password);
      setUser({ ...resp.usuario, access_token: resp.token });
      login(resp.token, resp.usuario);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message ?? "Contraseña incorrecta.");
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    setStep("correo");
    setError("");
    setCorreo("");
    setPassword("");
    setSessionToken(null);
  };

  const isCorreo = step === "correo";

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: marca ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 opacity-40" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-blue-700 opacity-50" />
        <div className="absolute top-1/2 left-3/4 w-48 h-48 rounded-full bg-blue-400 opacity-20" />

        {/* Encabezado */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">SYS Comercial</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Gestiona tu negocio<br />
            <span className="text-blue-200">sin complicaciones</span>
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Plataforma multiempresa para facturación, inventario, compras y reportes desde un solo lugar.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-100 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-blue-300 text-xs">
          © {new Date().getFullYear()} SYS Comercial · Todos los derechos reservados
        </p>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">

        {/* Logo móvil */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <Building2 className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">SYS Comercial</span>
        </div>

        <div className="w-full max-w-sm">

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full transition-colors ${isCorreo ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className="flex-1 h-px bg-gray-200" />
            <div className={`w-2 h-2 rounded-full transition-colors ${!isCorreo ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>

          {/* Título del paso */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">
              {isCorreo ? "Bienvenido" : "Ingresa tu contraseña"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isCorreo
                ? "Introduce tu correo para continuar"
                : <span>Accediendo como <strong className="text-gray-700">{correo}</strong></span>
              }
            </p>
          </div>

          <form onSubmit={isCorreo ? handleCorreo : handlePassword} className="space-y-4">

            {/* PASO 1: CORREO */}
            {isCorreo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="correo@empresa.com"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>
            )}

            {/* PASO 2: CONTRASEÑA */}
            {!isCorreo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {isCorreo ? "Verificando..." : "Ingresando..."}</>
                : isCorreo ? "Continuar" : "Ingresar"
              }
            </button>

            {/* Volver */}
            {!isCorreo && (
              <button
                type="button"
                onClick={handleBack}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Usar otro correo
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
