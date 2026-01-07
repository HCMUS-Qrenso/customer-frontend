/**
 * Order WebSocket Hook
 * Connect to WebSocket for real-time order updates using Socket.IO
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - REST fallback on reconnect to sync state
 * - Order room management
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSessionToken } from "@/lib/stores/qr-token-store";
import { orderApi } from "@/lib/api/order";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
const WS_NAMESPACE = "/orders";

// ============================================
// Types
// ============================================

interface OrderUpdateEvent {
  type: "order:updated" | "order:status";
  data: {
    id: string;
    orderNumber: string;
    status: string;
    items?: any[];
    [key: string]: any;
  };
  timestamp: string;
}

interface ItemStatusEvent {
  type: "item:status";
  data: {
    orderId: string;
    itemId: string;
    status: string;
    itemName: string;
    updatedBy?: string;
    updatedAt: string;
  };
  timestamp: string;
}

export interface UseOrderSocketOptions {
  onOrderUpdated?: (data: OrderUpdateEvent["data"]) => void;
  onItemStatusChanged?: (data: ItemStatusEvent["data"]) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  /** Enable REST sync on reconnect (default: true) */
  syncOnReconnect?: boolean;
  enabled?: boolean;
}

export interface UseOrderSocketReturn {
  isConnected: boolean;
  /** Whether we're syncing state via REST */
  isSyncing: boolean;
  disconnect: () => void;
  reconnect: () => void;
  /** Manually sync order state via REST */
  syncOrderState: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export function useOrderSocket(
  orderId: string | null,
  options: UseOrderSocketOptions = {},
): UseOrderSocketReturn {
  const {
    onOrderUpdated,
    onItemStatusChanged,
    onConnected,
    onDisconnected,
    onError,
    syncOnReconnect = true,
    enabled = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const reconnectCountRef = useRef(0);

  // Use refs for callbacks to avoid dependency changes causing reconnect loops
  const callbacksRef = useRef({
    onOrderUpdated,
    onItemStatusChanged,
    onConnected,
    onDisconnected,
    onError,
  });

  // Update refs when callbacks change (without causing re-renders)
  useEffect(() => {
    callbacksRef.current = {
      onOrderUpdated,
      onItemStatusChanged,
      onConnected,
      onDisconnected,
      onError,
    };
  }, [
    onOrderUpdated,
    onItemStatusChanged,
    onConnected,
    onDisconnected,
    onError,
  ]);

  /**
   * Sync order state via REST API
   * Called on reconnect to ensure we have the latest state
   */
  const syncOrderState = useCallback(async () => {
    if (!orderId && !syncOnReconnect) return;

    setIsSyncing(true);
    console.log("[OrderSocket] Syncing order state via REST...");

    try {
      // Get current order state from REST API
      const response = await orderApi.getMyOrder();

      if (response.success && response.data) {
        console.log(
          "[OrderSocket] REST sync complete, order:",
          response.data.orderNumber,
        );
        // Notify listeners with the synced state
        callbacksRef.current.onOrderUpdated?.({
          id: response.data.id,
          orderNumber: response.data.orderNumber,
          status: response.data.status,
          items: response.data.items,
          totalAmount: response.data.totalAmount,
        });
      }
    } catch (error) {
      console.error("[OrderSocket] REST sync failed:", error);
      // Don't propagate error - socket might still work
    } finally {
      setIsSyncing(false);
    }
  }, [orderId, syncOnReconnect]);

  const connect = useCallback(() => {
    const sessionToken = getSessionToken();

    // Don't connect if disabled or no session token
    if (!enabled || !sessionToken) {
      console.log(
        "[OrderSocket] Not connecting: enabled=",
        enabled,
        "hasToken=",
        !!sessionToken,
      );
      return;
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      console.log("[OrderSocket] Already connected");
      return;
    }

    console.log("[OrderSocket] Connecting to", WS_URL + WS_NAMESPACE);

    const socket = io(WS_URL + WS_NAMESPACE, {
      query: { sessionToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      console.log("[OrderSocket] Connected, socket.id=", socket.id);
      setIsConnected(true);

      // If this is a reconnect (not first connect), sync state via REST
      const isReconnect = reconnectCountRef.current > 0;
      reconnectCountRef.current++;

      if (isReconnect && syncOnReconnect) {
        console.log("[OrderSocket] Reconnected, syncing state via REST...");
        syncOrderState();
      }

      callbacksRef.current.onConnected?.();

      // Join order-specific room if orderId is provided
      if (orderId) {
        console.log("[OrderSocket] Joining order room:", orderId);
        socket.emit("joinOrder", { orderId });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[OrderSocket] Disconnected:", reason);
      setIsConnected(false);
      callbacksRef.current.onDisconnected?.();
    });

    socket.on("connect_error", (error) => {
      console.error("[OrderSocket] Connection error:", error.message);
      callbacksRef.current.onError?.(error);
    });

    // Order updated event (full order data)
    socket.on("order:updated", (event: OrderUpdateEvent) => {
      console.log("[OrderSocket] Order updated:", event);
      callbacksRef.current.onOrderUpdated?.(event.data);
    });

    // Order status changed
    socket.on("order:status", (event: OrderUpdateEvent) => {
      console.log("[OrderSocket] Order status:", event);
      callbacksRef.current.onOrderUpdated?.(event.data);
    });

    // Items added to order
    socket.on("order:items:added", (event: OrderUpdateEvent) => {
      console.log("[OrderSocket] Items added:", event);
      callbacksRef.current.onOrderUpdated?.(event.data);
    });

    // Item status changed (for individual item updates)
    socket.on("item:status", (event: ItemStatusEvent) => {
      console.log("[OrderSocket] Item status:", event);
      callbacksRef.current.onItemStatusChanged?.(event.data);
    });

    // Item ready notification
    socket.on("item:ready", (event: ItemStatusEvent) => {
      console.log("[OrderSocket] Item ready:", event);
      callbacksRef.current.onItemStatusChanged?.(event.data);
    });

    socketRef.current = socket;
  }, [orderId, enabled, syncOnReconnect, syncOrderState]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("[OrderSocket] Disconnecting");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    // Small delay before reconnecting
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  // Connect on mount, disconnect on unmount
  // Only re-run when orderId, enabled, or syncOnReconnect changes
  useEffect(() => {
    reconnectCountRef.current = 0; // Reset reconnect count
    connect();
    return () => {
      disconnect();
    };
  }, [orderId, enabled, syncOnReconnect]);

  // Join order room when orderId changes
  useEffect(() => {
    if (socketRef.current?.connected && orderId) {
      console.log("[OrderSocket] Joining order room:", orderId);
      socketRef.current.emit("joinOrder", { orderId });
    }
  }, [orderId]);

  // Sync state on visibility change (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isConnected &&
        syncOnReconnect
      ) {
        console.log("[OrderSocket] Tab became visible, syncing state...");
        syncOrderState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConnected, syncOnReconnect, syncOrderState]);

  return {
    isConnected,
    isSyncing,
    disconnect,
    reconnect,
    syncOrderState,
  };
}
