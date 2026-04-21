import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PublicLayout from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterDone from "./pages/RegisterDone";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AccountHome from "./pages/account/AccountHome";
import AdminHome from "./pages/admin/AdminHome";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              {/* Veřejné stránky */}
              <Route path="/" element={<Index />} />
              <Route path="/katalog" element={<Catalog />} />
              <Route path="/produkt/:slug" element={<ProductDetail />} />
              <Route path="/o-nas" element={<Placeholder title="O nás" />} />
              <Route path="/kontakt" element={<Placeholder title="Kontakt" />} />

              {/* Auth */}
              <Route path="/prihlaseni" element={<Login />} />
              <Route path="/registrace" element={<Register />} />
              <Route path="/registrace-hotovo" element={<RegisterDone />} />
              <Route path="/zapomenute-heslo" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Klientská zóna (vyžaduje přihlášení) */}
              <Route
                path="/ucet"
                element={
                  <ProtectedRoute>
                    <AccountHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ucet/objednavky"
                element={
                  <ProtectedRoute requireApproved>
                    <Placeholder title="Moje objednávky" description="Bude doplněno ve Fázi 4." />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ucet/faktury"
                element={
                  <ProtectedRoute requireApproved>
                    <Placeholder title="Faktury" description="Bude doplněno ve Fázi 5." />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ucet/adresy"
                element={
                  <ProtectedRoute>
                    <Placeholder title="Adresy" description="Bude doplněno ve Fázi 4." />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ucet/profil"
                element={
                  <ProtectedRoute>
                    <Placeholder title="Můj profil" description="Bude doplněno ve Fázi 4." />
                  </ProtectedRoute>
                }
              />

              {/* Admin (vyžaduje admin roli) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/:section"
                element={
                  <ProtectedRoute requireAdmin>
                    <Placeholder title="Admin sekce" description="Bude doplněno v dalších fázích." />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
