import { LogIn } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const LoginsPage = () => (
  <GenericEventPage type="login" title="Logins" subtitle="Logins no painel (merchant ou admin)" icon={LogIn} />
);

export default LoginsPage;
