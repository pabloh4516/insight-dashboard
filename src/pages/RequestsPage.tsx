import { Globe } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const RequestsPage = () => (
  <GenericEventPage type="request" title="Requests" subtitle="Requisições HTTP recebidas pelo gateway" icon={Globe} />
);

export default RequestsPage;
