import { RefreshCw } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const AcquirerSwitchPage = () => (
  <GenericEventPage type="acquirer_switch" title="Fallback de Adquirentes" subtitle="Fallback entre adquirentes acionado" icon={RefreshCw} />
);

export default AcquirerSwitchPage;
