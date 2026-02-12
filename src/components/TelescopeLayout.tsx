import { TelescopeSidebar } from "./TelescopeSidebar";
import { LiveNotification } from "./LiveNotification";

interface TelescopeLayoutProps {
  children: React.ReactNode;
}

export function TelescopeLayout({ children }: TelescopeLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background grid-bg">
      <TelescopeSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
      <LiveNotification />
    </div>
  );
}
