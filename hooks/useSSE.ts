import appConfig from '@/config/app.config';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SSEMessage {
    type: string;
    data: any;
}

export interface UseSSEOptions {
    url: string;
    onMessage?: (message: SSEMessage) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
    enabled?: boolean;
}

export interface UseSSEReturn {
    isConnected: boolean;
    error: Event | null;
    close: () => void;
}

/**
 * Custom hook for handling Server-Sent Events (SSE)
 * Maintains DRY principle by providing reusable SSE connection logic
 */
export function useSSE(options: UseSSEOptions): UseSSEReturn {
    const { url, onMessage, onError, onOpen, onClose, enabled = true } = options;
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Event | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const callbacksRef = useRef({ onMessage, onError, onOpen, onClose });

    // Keep callbacks ref updated
    useEffect(() => {
        callbacksRef.current = { onMessage, onError, onOpen, onClose };
    }, [onMessage, onError, onOpen, onClose]);

    useEffect(() => {
        if (!enabled || !url) {
            // Close existing connection if disabled or no URL
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Get auth token for SSE connection
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        // Build URL - handle existing query params
        let fullUrl: string;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // Absolute URL
            const urlObj = new URL(url);
            if (accessToken) {
                urlObj.searchParams.set('token', accessToken);
            }
            fullUrl = urlObj.toString();
        } else {
            // Relative URL - combine with base URL
            const baseUrl = appConfig.ACS_Endpoint.endsWith('/')
                ? appConfig.ACS_Endpoint.slice(0, -1)
                : appConfig.ACS_Endpoint;
            const path = url.startsWith('/') ? url : `/${url}`;
            const separator = url.includes('?') ? '&' : '?';
            fullUrl = `${baseUrl}${path}${accessToken ? `${separator}token=${accessToken}` : ''}`;
        }

        // Create EventSource connection
        const eventSource = new EventSource(fullUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setIsConnected(true);
            setError(null);
            callbacksRef.current.onOpen?.();
        };

        eventSource.onmessage = (event) => {
            try {
                const message: SSEMessage = JSON.parse(event.data);
                callbacksRef.current.onMessage?.(message);
            } catch (err) {
                console.error('Failed to parse SSE message:', err);
            }
        };

        eventSource.onerror = (err) => {
            setError(err);
            setIsConnected(false);
            callbacksRef.current.onError?.(err);
        };

        // Cleanup on unmount or dependency change
        return () => {
            if (eventSourceRef.current === eventSource) {
                eventSource.close();
                eventSourceRef.current = null;
                setIsConnected(false);
            }
        };
    }, [url, enabled]);

    const close = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsConnected(false);
            callbacksRef.current.onClose?.();
        }
    }, []);

    return {
        isConnected,
        error,
        close,
    };
}
