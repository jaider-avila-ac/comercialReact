import DocumentoFormPage from "../../components/form/DocumentoFormPage";
import { useFacturaForm } from "./useFacturaForm";

export default function FacturaFormPage() {
  const { facturaId, numero, ...rest } = useFacturaForm();
  return <DocumentoFormPage modo="factura" documentoId={facturaId} numero={numero} {...rest} />;
}
