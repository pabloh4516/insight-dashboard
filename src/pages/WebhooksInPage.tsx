import { ArrowDownLeft } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const WebhooksInPage = () => (
  <GenericEventPage type="webhook_in" title="Webhooks Recebidos" subtitle="Webhooks recebidos de adquirentes" icon={ArrowDownLeft} />
);

export default WebhooksInPage;
