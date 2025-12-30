/**
 * Order WebSocket Hook
 * Connect to WebSocket for real-time order updates using Socket.IO
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSessionToken } from '@/lib/stores/qr-token-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
const WS_NAMESPACE = '/orders';

// ============================================
// Types
// ============================================

interface OrderUpdateEvent {
  type: 'order:updated' | 'order:status';
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
  type: 'item:status';
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
  onOrderUpdated?: (data: OrderUpdateEvent['data']) => void;
  onItemStatusChanged?: (data: ItemStatusEvent['data']) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseOrderSocketReturn {
  isConnected: boolean;
  disconnect: () => void;
  reconnect: () => void;
}

// ============================================
// Hook
// ============================================

export function useOrderSocket(
  orderId: string | null,
  options: UseOrderSocketOptions = {}
): UseOrderSocketReturn {
  const {
    onOrderUpdated,
    onItemStatusChanged,
    onConnected,
    onDisconnected,
    onError,
    enabled = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const sessionToken = getSessionToken();
    
    // Don't connect if disabled or no session token
    if (!enabled || !sessionToken) {
      console.log('[OrderSocket] Not connecting: enabled=', enabled, 'hasToken=', !!sessionToken);
      return;
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      console.log('[OrderSocket] Already connected');
      return;
    }

    console.log('[OrderSocket] Connecting to', WS_URL + WS_NAMESPACE);

    const socket = io(WS_URL + WS_NAMESPACE, {
      query: { sessionToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[OrderSocket] Connected, socket.id=', socket.id);
      setIsConnected(true);
      onConnected?.();

      // Join order-specific room if orderId is provided
      if (orderId) {
        console.log('[OrderSocket] Joining order room:', orderId);
        socket.emit('joinOrder', { orderId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[OrderSocket] Disconnected:', reason);
      setIsConnected(false);
      onDisconnected?.();
    });

    socket.on('connect_error', (error) => {
      console.error('[OrderSocket] Connection error:', error.message);
      onError?.(error);
    });

    // Order updated event (full order data)
    socket.on('order:updated', (event: OrderUpdateEvent) => {
      console.log('[OrderSocket] Order updated:', event);
      onOrderUpdated?.(event.data);
    });

    // Order status changed
    socket.on('order:status', (event: OrderUpdateEvent) => {
      console.log('[OrderSocket] Order status:', event);
      onOrderUpdated?.(event.data);
    });

    // Item status changed (for individual item updates)
    socket.on('item:status', (event: ItemStatusEvent) => {
      console.log('[OrderSocket] Item status:', event);
      onItemStatusChanged?.(event.data);
    });

    // Item ready notification
    socket.on('item:ready', (event: ItemStatusEvent) => {
      console.log('[OrderSocket] Item ready:', event);
      onItemStatusChanged?.(event.data);
    });

    socketRef.current = socket;
  }, [orderId, enabled, onConnected, onDisconnected, onError, onOrderUpdated, onItemStatusChanged]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[OrderSocket] Disconnecting');
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
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Join order room when orderId changes
  useEffect(() => {
    if (socketRef.current?.connected && orderId) {
      console.log('[OrderSocket] Joining order room:', orderId);
      socketRef.current.emit('joinOrder', { orderId });
    }
  }, [orderId]);

  return {
    isConnected,
    disconnect,
    reconnect,
  };
}
