import { useState } from "react";
import { Menu } from "lucide-react";
import { TelescopeSidebar } from "./TelescopeSidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface TelescopeLayoutProps {
  children: React.ReactNode;
}

export function TelescopeLayout({ children }: TelescopeLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <TelescopeSidebar />
      </div>

      {/* Mobile drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <VisuallyHidden.Root>
            <SheetTitle>Menu de navegação</SheetTitle>
          </VisuallyHidden.Root>
          <TelescopeSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto dot-grid">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            Tele<span className="text-primary">scope</span>
          </h1>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
