import { type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react';

import Paho, {
    type Client as PahoClient,
    type ConnectionOptions,
    type MQTTError,
    type OnConnectHandler,
    type OnConnectionLostHandler,
    type OnMessageHandler,
    type OnSubscribeSuccessParams,
    type Qos,
    type TypedArray,
} from 'paho-mqtt';

function assertError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}

function getFallbackClientId(reactId: string): string {
    const normalizedId = reactId.replace(/[^A-Za-z0-9_-]/g, '');

    return `paho-ws-mqtt-${normalizedId || 'client'}`;
}

function formatUUID(bytes: Uint8Array): string {
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateClientId(reactId: string): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return `paho-ws-mqtt-${globalThis.crypto.randomUUID()}`;
    }

    if (typeof globalThis.crypto?.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);

        globalThis.crypto.getRandomValues(bytes);
        bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
        bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

        return `paho-ws-mqtt-${formatUUID(bytes)}`;
    }

    return getFallbackClientId(reactId);
}

interface MQTTHandlers {
    onMessage?: OnMessageHandler;
    onDelivery?: OnMessageHandler;
    onConnected?: OnConnectHandler;
    onDisconnect?: OnConnectionLostHandler;
}

export const usePahoMQTTClient = (uri: string,
    handlers?: MQTTHandlers, connectionOptions?: ConnectionOptions, clientId?: string) => {
    const reactId = useId();
    const [generatedClientId] = useState(() => generateClientId(reactId));
    const resolvedClientId = clientId ?? generatedClientId;
    const client = useRef<PahoClient | null>(null);

    if (client.current === null) {
        client.current = new Paho.Client(uri, resolvedClientId);
    }

    const opts = useRef(connectionOptions);
    const callbacks = useRef(handlers);
    const reconnectTimer = useRef<number | undefined>(undefined);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<MQTTError | undefined>(undefined);
    useEffect(() => {
        const c = client;
        const currentClient = c.current;
        const rct = reconnectTimer;

        if (currentClient === null) {
            return;
        }

        const o = {
            timeout: 5,
            ...opts.current,
            onFailure: (e: MQTTError) => {
                setError(e);
                setConnected(currentClient.isConnected());
                rct.current ??= window.setInterval(() => {
                    if (currentClient.isConnected()) {
                        clearInterval(rct.current);
                    } else {
                        currentClient.connect(o);
                    }
                }, 5000);
            },
            onSuccess: () => {
                setError(undefined);
                setConnected(currentClient.isConnected());
                if (rct.current !== undefined) {
                    window.clearInterval(rct.current);
                    rct.current = undefined;
                }
            },
        } as ConnectionOptions;
        const cbs = callbacks.current;
        currentClient.onConnectionLost = (e: MQTTError) => {
            setError(e);
            setConnected(currentClient.isConnected());
            cbs?.onDisconnect?.(e);
        };
        currentClient.onConnected = (reconnect: boolean, host: string) => {
            setConnected(currentClient.isConnected());
            setError(undefined);
            cbs?.onConnected?.(reconnect, host);
        };
        if (cbs) {
            if (cbs.onMessage) {
                currentClient.onMessageArrived = cbs.onMessage;
            }
            if (cbs.onDelivery) {
                currentClient.onMessageDelivered = cbs.onDelivery;
            }
        }
        try {
            currentClient.connect(o);
        } catch (_e) {
            window.setTimeout(() => {
                currentClient.connect(o);
            }, 5000);
        }
        return () => {
            try {
                currentClient.disconnect();
                if (rct.current !== undefined) {
                    window.clearInterval(rct.current);
                }
            } catch (e) {
                console.log(e);
            }
        };

    }, []);


    const sub = useCallback((topic: string, qos?: Qos) => {
        return new Promise<Qos>((resolve) => {
            if (client.current === null) {
                throw new Error('MQTT client is not initialized');
            }
            client.current.subscribe(topic, {
                qos: qos ?? 0,
                timeout: 1,
                onFailure: (e: MQTTError) => {
                    throw assertError(e);
                },
                onSuccess: (res: OnSubscribeSuccessParams) => {
                    resolve(res.grantedQos);
                }
            });
        });
    }, [client]);

    const pub = useCallback((topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => {
        if (client.current === null) {
            throw new Error('MQTT client is not initialized');
        }
        let sendPayload: string | ArrayBuffer;
        if (typeof payload === 'string') {
            sendPayload = payload;
        } else if (ArrayBuffer.isView(payload)) {
            // Always create a new ArrayBuffer to guarantee type
            sendPayload = new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength).slice().buffer;
        } else {
            throw new Error('Payload must be a string or TypedArray');
        }
        client.current.send(topic, sendPayload, qos, retained);
    }, [client]);

    const unsub = useCallback((topic: string) => {
        return new Promise<void>((resolve) => {
            if (client.current === null) {
                throw new Error('MQTT client is not initialized');
            }
            client.current.unsubscribe(topic, {
                timeout: 1,
                onSuccess: () => {
                    resolve();
                },
                onFailure: (e: MQTTError) => {
                    throw assertError(e);
                }
            });
        });
    }, [client]);

    return {
        client: client as RefObject<PahoClient>,
        connected,
        error,
        sub,
        pub,
        unsub,
    };
};
