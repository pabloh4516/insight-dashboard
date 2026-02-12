import { Cog } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const JobsPage = () => (
  <GenericEventPage type="job" title="Jobs" subtitle="Tarefas em fila processadas pelo gateway" icon={Cog} />
);

export default JobsPage;
