import DocumentoFormPage from "../../components/form/DocumentoFormPage";
import { useFacturaForm } from "./useFacturaForm";

export default function FacturaFormPage() {
  const { facturaId, ...rest } = useFacturaForm();
  return <DocumentoFormPage modo="factura" documentoId={facturaId} {...rest} />;
}
