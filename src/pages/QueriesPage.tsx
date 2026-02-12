import { Database } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const QueriesPage = () => (
  <GenericEventPage type="query" title="Queries" subtitle="Consultas SQL executadas pelo gateway" icon={Database} />
);

export default QueriesPage;
