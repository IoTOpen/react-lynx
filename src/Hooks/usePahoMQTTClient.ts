import { useCallback, useLayoutEffect, useRef, useState } from 'react';

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

interface MQTTHandlers {
    onMessage?: OnMessageHandler;
    onDelivery?: OnMessageHandler;
    onConnected?: OnConnectHandler;
    onDisconnect?: OnConnectionLostHandler;
}

export const usePahoMQTTClient = (uri: string,
    handlers?: MQTTHandlers, connectionOptions?: ConnectionOptions, clientId?: string) => {
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
    const client = useRef<PahoClient>(new Paho.Client(uri, clientId));
    const opts = useRef(connectionOptions);
    const callbacks = useRef(handlers);
    const reconnectTimer = useRef<number | undefined>(undefined);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<MQTTError | undefined>(undefined);
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
        } as ConnectionOptions;
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
        } catch (_e) {
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
            } catch (e) {
                console.log(e);
            }
        };

    }, []);


    const sub = useCallback((topic: string, qos?: Qos) => {
        return new Promise<Qos>((resolve) => {
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
        client,
        connected,
        error,
        sub,
        pub,
        unsub,
    };
};
