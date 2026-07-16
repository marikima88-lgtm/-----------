import React, { useState } from 'react';
import { Container } from '@mui/material';
import { OrdersProvider, useOrders } from './OrdersContext';
import { OrdersList } from './OrdersList';
import { OrderForm } from './OrderForm';
import { OrderExecution } from './OrderExecution';
import { OrderPrint } from './OrderPrint';
import { CashOrder } from './types';

type Screen =
  | { name: 'list' }
  | { name: 'form'; orderId?: string }
  | { name: 'execute'; orderId: string }
  | { name: 'print'; orderId: string };

function CashOrdersRouter() {
  const { getOrder } = useOrders();
  const [screen, setScreen] = useState<Screen>({ name: 'list' });

  function openOrder(order: CashOrder) {
    if (order.status === 'draft') setScreen({ name: 'form', orderId: order.id });
    else setScreen({ name: 'execute', orderId: order.id });
  }

  switch (screen.name) {
    case 'list':
      return <OrdersList onSelect={openOrder} onCreate={() => setScreen({ name: 'form' })} />;

    case 'form':
      return (
        <OrderForm
          orderId={screen.orderId}
          onSent={() => setScreen({ name: 'list' })}
          onCancelled={() => setScreen({ name: 'list' })}
        />
      );

    case 'execute':
      return (
        <OrderExecution
          orderId={screen.orderId}
          onBack={() => setScreen({ name: 'list' })}
          onPrint={(id) => setScreen({ name: 'print', orderId: id })}
        />
      );

    case 'print': {
      const order = getOrder(screen.orderId);
      if (!order) return null;
      return <OrderPrint order={order} onClose={() => setScreen({ name: 'execute', orderId: order.id })} />;
    }

    default:
      return null;
  }
}

/**
 * Requires: react-hook-form@^7.71.1, @mui/material@^5.10.13,
 * @mui/icons-material@^5, @emotion/react, @emotion/styled.
 * Wrap the app in a MUI ThemeProvider from the host project if custom theming is needed.
 */
export function CashOrdersApp() {
  return (
    <OrdersProvider>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CashOrdersRouter />
      </Container>
    </OrdersProvider>
  );
}
