import { HardDrive } from "lucide-react";
import { GenericEventPage } from "@/components/GenericEventPage";

const CachePage = () => (
  <GenericEventPage type="cache" title="Cache" subtitle="Operações de cache do gateway" icon={HardDrive} />
);

export default CachePage;
