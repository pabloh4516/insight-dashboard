import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TelescopeLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
