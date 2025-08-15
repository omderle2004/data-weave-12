import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Connections from "./pages/Connections";
import Settings from "./pages/Settings";
import Members from "./pages/Members";
import SpreadsheetEditor from "./pages/SpreadsheetEditor";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/files" element={<Files />} />
              <Route path="/my-files" element={<Files />} />
              <Route path="/shared" element={<Files />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/members" element={<Members />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/editor" element={<SpreadsheetEditor />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forum" element={<Contact />} />
              <Route path="/examples" element={<Dashboard />} />
              <Route path="/docs" element={<Dashboard />} />
              <Route path="/support" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
