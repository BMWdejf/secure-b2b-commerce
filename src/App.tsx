import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PublicLayout from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterDone from "./pages/RegisterDone";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AccountHome from "./pages/account/AccountHome";
import Cart from "./pages/account/Cart";
import Checkout from "./pages/account/Checkout";
import MyOrders from "./pages/account/MyOrders";
import OrderDetail from "./pages/account/OrderDetail";
import Addresses from "./pages/account/Addresses";
import Profile from "./pages/account/Profile";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminClients from "./pages/admin/AdminClients";
import AdminPricelists from "./pages/admin/AdminPricelists";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminStats from "./pages/admin/AdminStats";
import Invoices from "./pages/account/Invoices";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import CmsPage from "./pages/CmsPage";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
          <CartProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                {/* Veřejné stránky */}
                <Route path="/" element={<Index />} />
                <Route path="/katalog" element={<Catalog />} />
                <Route path="/produkt/:slug" element={<ProductDetail />} />
                <Route path="/o-nas" element={<CmsPage slugOverride="o-nas" />} />
                <Route path="/kontakt" element={<Contact />} />
                <Route path="/stranka/:slug" element={<CmsPage />} />

                {/* Auth */}
                <Route path="/prihlaseni" element={<Login />} />
                <Route path="/registrace" element={<Register />} />
                <Route path="/registrace-hotovo" element={<RegisterDone />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/zapomenute-heslo" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Klientská zóna */}
                <Route path="/ucet" element={<ProtectedRoute><AccountHome /></ProtectedRoute>} />
                <Route path="/ucet/kosik" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/ucet/checkout" element={<ProtectedRoute requireApproved><Checkout /></ProtectedRoute>} />
                <Route path="/ucet/objednavky" element={<ProtectedRoute requireApproved><MyOrders /></ProtectedRoute>} />
                <Route path="/ucet/objednavky/:id" element={<ProtectedRoute requireApproved><OrderDetail /></ProtectedRoute>} />
                <Route path="/ucet/faktury" element={<ProtectedRoute requireApproved><Invoices /></ProtectedRoute>} />
                <Route path="/ucet/adresy" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
                <Route path="/ucet/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="produkty" element={<AdminProducts />} />
                  <Route path="produkty/novy" element={<AdminProductForm />} />
                  <Route path="produkty/:id" element={<AdminProductForm />} />
                  <Route path="kategorie" element={<AdminCategories />} />
                  <Route path="ceniky" element={<AdminPricelists />} />
                  <Route path="klienti" element={<AdminClients />} />
                  <Route path="objednavky" element={<AdminOrders />} />
                  <Route path="objednavky/:id" element={<AdminOrderDetail />} />
                  <Route path="statistiky" element={<AdminStats />} />
                  <Route path="nastaveni" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
