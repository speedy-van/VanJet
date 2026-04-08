// ─── VanJet · New Order Event Bus ─────────────────────────────
// Simple in-memory event emitter for SSE connections

type Listener = (data: OrderEvent) => void;

export interface OrderEvent {
  type: "new_order" | "order_update" | "order_cancelled";
  orderId: string;
  orderNumber: string;
  serviceType: string;
  pickup: string;
  delivery: string;
  price: number;
  createdAt: string;
}

class NewOrderEventBus {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: OrderEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("[EventBus] Listener error:", error);
      }
    }
  }

  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Global singleton (survives hot reloads in dev)
const globalForEventBus = globalThis as unknown as {
  newOrderEventBus: NewOrderEventBus | undefined;
};

export const newOrderEventBus =
  globalForEventBus.newOrderEventBus ?? new NewOrderEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEventBus.newOrderEventBus = newOrderEventBus;
}

// Helper to emit new order event
export function emitNewOrder(order: {
  id: string;
  orderNumber: string;
  serviceType: string;
  pickupPostcode: string;
  deliveryPostcode: string;
  finalPrice: number | null;
  createdAt: Date;
}) {
  newOrderEventBus.emit({
    type: "new_order",
    orderId: order.id,
    orderNumber: order.orderNumber,
    serviceType: order.serviceType,
    pickup: order.pickupPostcode,
    delivery: order.deliveryPostcode,
    price: order.finalPrice ?? 0,
    createdAt: order.createdAt.toISOString(),
  });
}
