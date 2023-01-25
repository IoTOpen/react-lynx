import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import Paho, {MQTTError, Qos, TypedArray} from 'paho-mqtt';

interface MQTTHandlers {
    onMessage?: Paho.OnMessageHandler;
    onDelivery?: Paho.OnMessageHandler;
    onConnected?: Paho.OnConnectHandler;
    onDisconnect?: Paho.OnConnectionLostHandler;
}

export const usePahoMQTTClient = (uri: string,
    handlers?: MQTTHandlers, connectionOptions?: Paho.ConnectionOptions, clientId?: string) => {
    if (clientId === undefined) {
        clientId = `paho-ws-mqtt-${window.crypto.randomUUID()}`;
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
                if (rct.current === undefined) {
                    rct.current = window.setInterval(() => {
                        c.current.connect(o);
                    }, 1000);
                }
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
        } catch (e) {
            window.setTimeout(() => {
                c.current.connect(o);
            }, 1000);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const sub = useCallback((topic: string, qos?: Qos) => {
        return new Promise<Qos>((resolve) => {
            client.current.subscribe(topic, {
                qos: qos ? qos : 0,
                timeout: 1,
                onFailure: (e: MQTTError) => {
                    throw e;
                },
                onSuccess: (res) => {
                    resolve(res.grantedQos);
                }
            });
        });
    }, [client]);

    const pub = useCallback((topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => {
        client.current.send(topic, payload, qos, retained);
    }, [client]);

    const unsub = useCallback((topic: string) => {
        return new Promise<void>((resolve) => {
            client.current.unsubscribe(topic, {
                timeout: 1,
                onSuccess: () => {
                    resolve();
                },
                onFailure: (e: MQTTError) => {
                    throw e;
                }
            });
        });
    }, [client]);

    return {
        client: client,
        connected: connected,
        error: error,
        sub: sub,
        pub: pub,
        unsub: unsub,
    };
};
