import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TelescopeLayout } from "@/components/TelescopeLayout";
import DashboardOverview from "./pages/DashboardOverview";
import LogsPage from "./pages/LogsPage";
import EventsPage from "./pages/EventsPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import QueriesPage from "./pages/QueriesPage";
import JobsPage from "./pages/JobsPage";
import MailPage from "./pages/MailPage";
import CachePage from "./pages/CachePage";
import CommandsPage from "./pages/CommandsPage";
import RequestsPage from "./pages/RequestsPage";
import SecurityPage from "./pages/SecurityPage";
import WebhooksInPage from "./pages/WebhooksInPage";
import WebhooksOutPage from "./pages/WebhooksOutPage";
import LoginsPage from "./pages/LoginsPage";
import ConfigChangesPage from "./pages/ConfigChangesPage";
import AcquirerSwitchPage from "./pages/AcquirerSwitchPage";
import ProjectsPage from "./pages/ProjectsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><span className="text-xs text-muted-foreground">Carregando...</span></div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <ProjectProvider>
      <TelescopeLayout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/queries" element={<QueriesPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/mails" element={<MailPage />} />
          <Route path="/cache" element={<CachePage />} />
          <Route path="/commands" element={<CommandsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/webhooks-in" element={<WebhooksInPage />} />
          <Route path="/webhooks-out" element={<WebhooksOutPage />} />
          <Route path="/logins" element={<LoginsPage />} />
          <Route path="/config-changes" element={<ConfigChangesPage />} />
          <Route path="/acquirer-switch" element={<AcquirerSwitchPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TelescopeLayout>
    </ProjectProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
