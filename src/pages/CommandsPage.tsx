import { Terminal } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const CommandsPage = () => (
  <GenericEventPage type="command" title="Commands" subtitle="Comandos CLI executados pelo gateway" icon={Terminal} />
);

export default CommandsPage;
