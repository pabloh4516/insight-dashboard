import { TelescopeSidebar } from "./TelescopeSidebar";
import { LiveNotification } from "./LiveNotification";

interface TelescopeLayoutProps {
  children: React.ReactNode;
}

export function TelescopeLayout({ children }: TelescopeLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <TelescopeSidebar />
      <main className="flex-1 overflow-auto dot-grid">
        <div className="p-8">
          {children}
        </div>
      </main>
      <LiveNotification />
    </div>
  );
}
