import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TelescopeLayout } from "@/components/TelescopeLayout";
import DashboardOverview from "./pages/DashboardOverview";
import RequestsPage from "./pages/RequestsPage";
import ClientRequestsPage from "./pages/ClientRequestsPage";
import JobsPage from "./pages/JobsPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import LogsPage from "./pages/LogsPage";
import QueriesPage from "./pages/QueriesPage";
import MailPage from "./pages/MailPage";
import EventsPage from "./pages/EventsPage";
import CachePage from "./pages/CachePage";
import CommandsPage from "./pages/CommandsPage";
import TimelinePage from "./pages/TimelinePage";
import ProjectsPage from "./pages/ProjectsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><span className="text-xs text-muted-foreground">Carregando...</span></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const realtimeValue = useRealtimeData();

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
      <RealtimeProvider value={realtimeValue}>
        <TelescopeLayout>
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/client-requests" element={<ClientRequestsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/exceptions" element={<ExceptionsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/queries" element={<QueriesPage />} />
            <Route path="/mail" element={<MailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/cache" element={<CachePage />} />
            <Route path="/commands" element={<CommandsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TelescopeLayout>
      </RealtimeProvider>
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
