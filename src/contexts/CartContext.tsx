import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { addToCart as apiAdd, clearCart as apiClear, fetchCart, fetchPricesForProducts, removeCartItem as apiRemove, resolveUnitPrice, updateCartItemQty as apiUpdate, type CartItemRow } from "@/lib/api/cart";
import { toast } from "sonner";

export interface CartLine extends CartItemRow {
  unit_price: number | null;
  line_total: number | null;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number | null;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, qty: number) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const Ctx = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isApproved } = useAuth();
  const [rows, setRows] = useState<CartItemRow[]>([]);
  const [prices, setPrices] = useState<Record<string, { unit_price: number; min_qty: number }[]>>({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      setPrices({});
      return;
    }
    setLoading(true);
    try {
      const r = await fetchCart(user.id);
      setRows(r);
      if (isApproved && r.length > 0) {
        const p = await fetchPricesForProducts(r.map((x) => x.product_id));
        setPrices(p);
      } else {
        setPrices({});
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const lines: CartLine[] = useMemo(() => {
    return rows.map((r) => {
      const unit_price = isApproved ? resolveUnitPrice(prices[r.product_id], r.qty) : null;
      return { ...r, unit_price, line_total: unit_price != null ? unit_price * r.qty : null };
    });
  }, [rows, prices, isApproved]);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => {
    if (!isApproved) return null;
    return lines.reduce((s, l) => s + (l.line_total ?? 0), 0);
  }, [lines, isApproved]);

  const add = async (productId: string, qty: number) => {
    if (!user) {
      toast.error("Pro objednávku se prosím přihlaste");
      return;
    }
    if (!isApproved) {
      toast.error("Váš účet ještě nebyl schválen");
      return;
    }
    await apiAdd(user.id, productId, qty);
    await refresh();
    toast.success("Přidáno do košíku");
  };

  const setQty = async (itemId: string, qty: number) => {
    await apiUpdate(itemId, qty);
    await refresh();
  };

  const remove = async (itemId: string) => {
    await apiRemove(itemId);
    await refresh();
  };

  const clear = async () => {
    if (!user) return;
    await apiClear(user.id);
    await refresh();
  };

  return (
    <Ctx.Provider value={{ lines, count, subtotal, loading, refresh, add, setQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart musí být uvnitř CartProvider");
  return c;
}
