import { Settings } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const ConfigChangesPage = () => (
  <GenericEventPage type="config_change" title="Alterações de Config" subtitle="Configurações alteradas por administradores" icon={Settings} />
);

export default ConfigChangesPage;
