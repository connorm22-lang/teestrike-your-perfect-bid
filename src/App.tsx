import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CourseAdminProvider } from "./admin/CourseAdminContext";
import { AdminLayout, RequireAdminAuth } from "./admin/AdminLayout";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminNewSlotPage from "./admin/pages/AdminNewSlotPage";
import AdminAuctionsPage from "./admin/pages/AdminAuctionsPage";
import AdminTransactionsPage from "./admin/pages/AdminTransactionsPage";
import AdminSettingsPage from "./admin/pages/AdminSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CourseAdminProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Admin (course operator) routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAdminAuth>
                  <AdminLayout />
                </RequireAdminAuth>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="slots/new" element={<AdminNewSlotPage />} />
              <Route path="auctions" element={<AdminAuctionsPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CourseAdminProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
