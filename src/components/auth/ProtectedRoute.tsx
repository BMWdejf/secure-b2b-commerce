import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  requireApproved?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireApproved = false }: Props) {
  const { user, loading, isAdmin, isApproved } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/prihlaseni" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/ucet" replace />;
  }

  if (requireApproved && !isApproved && !isAdmin) {
    return <Navigate to="/ucet" replace />;
  }

  return <>{children}</>;
}
