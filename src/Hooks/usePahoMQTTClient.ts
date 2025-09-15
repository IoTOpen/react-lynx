import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { MQTTError, Qos, TypedArray } from 'paho-mqtt';
import Paho from 'paho-mqtt';

interface MQTTHandlers {
    onMessage?: Paho.OnMessageHandler;
    onDelivery?: Paho.OnMessageHandler;
    onConnected?: Paho.OnConnectHandler;
    onDisconnect?: Paho.OnConnectionLostHandler;
}

export const usePahoMQTTClient = (uri: string,
    handlers?: MQTTHandlers, connectionOptions?: Paho.ConnectionOptions, clientId?: string) => {
    if (clientId === undefined) {
        let uuid;
        if (window?.crypto?.randomUUID) {
            uuid = window.crypto.randomUUID();
        } else if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
            uuid = crypto.randomUUID();
        } else {
            uuid = Math.random().toString(36).substring(2, 15);
        }
        clientId = `paho-ws-mqtt-${uuid}`;
    }
    const client = useRef<Paho.Client>(new Paho.Client(uri, clientId));
    const opts = useRef(connectionOptions);
    const callbacks = useRef(handlers);
    const reconnectTimer = useRef<number | undefined>(undefined);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<Paho.MQTTError | undefined>(undefined);
    useLayoutEffect(() => {
        const c = client;
        const rct = reconnectTimer;
        const o = {
            timeout: 5,
            ...opts.current,
            onFailure: (e: MQTTError) => {
                setError(e);
                setConnected(client.current.isConnected());
                rct.current ??= window.setInterval(() => {
                    if (c.current.isConnected()) {
                        clearInterval(rct.current);
                    } else {
                        c.current.connect(o);
                    }
                }, 5000);
            },
            onSuccess: () => {
                setError(undefined);
                setConnected(client.current.isConnected());
                if (rct.current !== undefined) {
                    window.clearInterval(rct.current);
                    rct.current = undefined;
                }
            },
        } as Paho.ConnectionOptions;
        const cbs = callbacks.current;
        c.current.onConnectionLost = (e: MQTTError) => {
            setError(e);
            setConnected(client.current.isConnected());
            cbs?.onDisconnect?.(e);
        };
        c.current.onConnected = (reconnect: boolean, host: string) => {
            setConnected(client.current.isConnected());
            setError(undefined);
            cbs?.onConnected?.(reconnect, host);
        };
        if (cbs) {
            if (cbs.onMessage) {
                c.current.onMessageArrived = cbs.onMessage;
            }
            if (cbs.onDelivery) {
                c.current.onMessageDelivered = cbs.onDelivery;
            }
        }
        try {
            c.current.connect(o);
        } catch (err) {
            // Fallback connection attempt if the initial synchronous call fails.
            console.error('# 🐛 Initial MQTT connection failed, retrying in 5s:', err);
            window.setTimeout(() => {
                c.current.connect(o);
            }, 5000);
        }
        return () => {
            try {
                c.current.disconnect();
                if (rct.current !== undefined) {
                    window.clearInterval(rct.current);
                }
            } catch (err) {
                console.log(err);
            }
        };

    }, []);


    const sub = useCallback((topic: string, qos?: Qos) => new Promise<Qos>((resolve, reject) => {
        client.current.subscribe(topic, {
            qos: qos ?? 0, // Use nullish coalescing to allow qos=0
            timeout: 1,
            onFailure: (e: MQTTError) => {
                reject(new Error(`MQTT Subscription failed: ${e.errorMessage}`));
            },
            onSuccess: (res) => {
                resolve(res.grantedQos);
            }
        });
    }), [client]);

    const pub = useCallback((topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => {
        // The Paho client's send method expects a string or an ArrayBuffer.
        // If the payload is a TypedArray, we must pass its underlying buffer.
        // We must ensure we are not passing a SharedArrayBuffer.
        const message = typeof payload === 'string' ? payload : payload.buffer instanceof ArrayBuffer ? payload.buffer : new ArrayBuffer(0);
        client.current.send(topic, message, qos, retained);
    }, [client]);

    const unsub = useCallback((topic: string) => new Promise<void>((resolve, reject) => {
        client.current.unsubscribe(topic, {
            timeout: 1,
            onSuccess: () => {
                resolve();
            },
            onFailure: (e: MQTTError) => {
                reject(new Error(`MQTT Unsubscribe failed: ${e.errorMessage}`));
            }
        });
    }), [client]);

    return {
        client,
        connected,
        error,
        sub,
        pub,
        unsub,
    };
};
