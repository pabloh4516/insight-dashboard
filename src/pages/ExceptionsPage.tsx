import { AlertTriangle } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const ExceptionsPage = () => (
  <GenericEventPage type="exception" title="Exceptions" subtitle="Exceções e erros capturados pelo gateway" icon={AlertTriangle} />
);

export default ExceptionsPage;
