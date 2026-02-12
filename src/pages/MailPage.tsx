import { Mail } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const MailPage = () => (
  <GenericEventPage type="email" title="Mail" subtitle="E-mails enviados pelo gateway" icon={Mail} />
);

export default MailPage;
