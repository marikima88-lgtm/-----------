import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CashOrder, OrderStatus } from './types';
import { initialOrders } from './mockData';

interface OrdersContextValue {
  orders: CashOrder[];
  getOrder: (id: string) => CashOrder | undefined;
  saveOrder: (order: CashOrder) => void;
  setStatus: (id: string, status: OrderStatus, patch?: Partial<CashOrder>) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<CashOrder[]>(initialOrders);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const saveOrder = useCallback((order: CashOrder) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = order;
        return next;
      }
      return [order, ...prev];
    });
  }, []);

  const setStatus = useCallback((id: string, status: OrderStatus, patch?: Partial<CashOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? ({ ...o, ...patch, status } as CashOrder) : o)));
  }, []);

  const value = useMemo(
    () => ({ orders, getOrder, saveOrder, setStatus }),
    [orders, getOrder, saveOrder, setStatus],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
