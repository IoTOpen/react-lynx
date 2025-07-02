import Paho from 'paho-mqtt';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
export const usePahoMQTTClient = (uri, handlers, connectionOptions, clientId) => {
    if (clientId === undefined) {
        let uuid;
        if (window?.crypto?.randomUUID) {
            uuid = window.crypto.randomUUID();
        }
        else if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
            uuid = crypto.randomUUID();
        }
        else {
            uuid = Math.random().toString(36).substring(2, 15);
        }
        clientId = `paho-ws-mqtt-${uuid}`;
    }
    const client = useRef(new Paho.Client(uri, clientId));
    const opts = useRef(connectionOptions);
    const callbacks = useRef(handlers);
    const reconnectTimer = useRef(undefined);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(undefined);
    useLayoutEffect(() => {
        const c = client;
        const rct = reconnectTimer;
        const o = {
            timeout: 5,
            ...opts.current,
            onFailure: (e) => {
                setError(e);
                setConnected(client.current.isConnected());
                if (rct.current === undefined) {
                    rct.current = window.setInterval(() => {
                        if (c.current.isConnected()) {
                            clearInterval(rct.current);
                        }
                        else {
                            c.current.connect(o);
                        }
                    }, 5000);
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
        };
        const cbs = callbacks.current;
        c.current.onConnectionLost = (e) => {
            setError(e);
            setConnected(client.current.isConnected());
            cbs?.onDisconnect?.(e);
        };
        c.current.onConnected = (reconnect, host) => {
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
        }
        catch (e) {
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
            }
            catch (e) {
                console.log(e);
            }
        };
    }, []);
    const sub = useCallback((topic, qos) => {
        return new Promise((resolve) => {
            client.current.subscribe(topic, {
                qos: qos ? qos : 0,
                timeout: 1,
                onFailure: (e) => {
                    throw e;
                },
                onSuccess: (res) => {
                    resolve(res.grantedQos);
                }
            });
        });
    }, [client]);
    const pub = useCallback((topic, payload, qos, retained) => {
        client.current.send(topic, payload, qos, retained);
    }, [client]);
    const unsub = useCallback((topic) => {
        return new Promise((resolve) => {
            client.current.unsubscribe(topic, {
                timeout: 1,
                onSuccess: () => {
                    resolve();
                },
                onFailure: (e) => {
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
//# sourceMappingURL=usePahoMQTTClient.js.map