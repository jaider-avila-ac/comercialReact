import DocumentoFormPage from "../../components/form/DocumentoFormPage";
import { useCotizacionForm } from "./useCotizacionForm";

export default function CotizacionFormPage() {
  const { cotizacionId, ...rest } = useCotizacionForm();
  return <DocumentoFormPage modo="cotizacion" documentoId={cotizacionId} {...rest} />;
}
