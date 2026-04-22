import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export function CartIcon() {
  const { user } = useAuth();
  const { count } = useCart();
  if (!user) return null;
  return (
    <Link
      to="/ucet/kosik"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-secondary"
      aria-label="Košík"
    >
      <ShoppingCart className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
