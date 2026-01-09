import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CasesPage from "./pages/CasesPage";
import UploadPage from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";
import ReportsPage from "./pages/ReportsPage";
import BlockchainPage from "./pages/BlockchainPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cases" element={<AppLayout><CasesPage /></AppLayout>} />
          <Route path="/cases/:id" element={<AppLayout><AnalysisPage /></AppLayout>} />
          <Route path="/upload" element={<AppLayout><UploadPage /></AppLayout>} />
          <Route path="/analysis" element={<AppLayout><AnalysisPage /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
          <Route path="/blockchain" element={<AppLayout><BlockchainPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
