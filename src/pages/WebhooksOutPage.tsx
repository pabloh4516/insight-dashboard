import { ArrowUpRight } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const WebhooksOutPage = () => (
  <GenericEventPage type="webhook_out" title="Webhooks Enviados" subtitle="Postbacks enviados aos merchants" icon={ArrowUpRight} />
);

export default WebhooksOutPage;
