import {usePahoMQTTClient} from './usePahoMQTTClient';
import {useCallback, useEffect, useRef} from 'react';
import Paho, {Qos, TypedArray} from 'paho-mqtt';

export type Binding = (topic: string, payload: string, qos: Qos, retained: boolean) => void;

export type Binder = (topic: RegExp | string, binder: Binding) => void;
export type Unbinder = (binder: Binding) => void;

export type ExactBinder = (topic: string, binder: Binding) => void;
export type ExactUnbinder = (topic: string, binder: Binding) => void;

export type Publisher = (topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => void;

function isEq<T>(a: T[], b: T[]): boolean {
    if (a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

type Unsub = (topic: string) => void | Promise<void>;

function unsubscribe(unsub: Unsub, subs: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
        subs.forEach(async (topic) => {
            try {
                await unsub(topic);
            } catch (e) {
                console.warn('failed to unsubscribe to', topic, e);
            }
        });
        resolve();
    });
}

function subscribe(sub: (topic: string, qos?: Qos) => void | Promise<Qos>, subs: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
        subs.forEach(async (topic) => {
            try {
                await sub(topic);
            } catch (e) {
                console.warn('failed to subscribe to', topic, e);
            }
        });
        resolve();
    });
}

export interface SimpleMQTT {
    setSubs: (subscriptions: string[]) => void;
    error?: Paho.MQTTError;
    connected: boolean;
    bind: Binder;
    unbind: Unbinder;
    bindExact: ExactBinder;
    unbindExact: ExactUnbinder;
    pub: Publisher;
}

export const useSimpleMQTT = (uri?: string, username?: string, password?: string) => {
    if (uri === undefined) {
        if (window !== undefined) {
            uri = window.location.protocol === 'http:' ? `ws://${window.location.host}/mqtt` : `wss://${window.location.host}/mqtt`;
        } else {
            uri = location.protocol === 'http:' ? `ws://${location.host}/mqtt` : `wss://${location.host}/mqtt`;
        }
    }
    const subs = useRef<string[]>([]);
    const bindings = useRef(new Map<string, Binding[]>([]));
    const exactBindings = useRef(new Map<string, Binding[]>([]));
    const onMessage = useCallback((msg: Paho.Message) => {
        const tmp = exactBindings.current.get(msg.destinationName);
        if (tmp) {
            tmp.forEach((cb) => {
                cb(msg.destinationName, new TextDecoder().decode(msg.payloadBytes), msg.qos, msg.retained);
            });
        }
        bindings.current.forEach((binds, key) => {
            const re = new RegExp(key);
            if (re.test(msg.destinationName)) {
                binds.forEach(cb => {
                    cb(msg.destinationName, new TextDecoder().decode(msg.payloadBytes), msg.qos, msg.retained);
                });
            }
        });
    }, []);
    const c = useRef<boolean>(false);

    const options = {
        cleanSession: true,
        reconnect: true,
        keepAliveInterval: 5,
    } as Paho.ConnectionOptions;
    if (username) {
        options.userName = username;
    }
    if (password) {
        options.password = password;
    }
    const {
        error,
        connected,
        sub,
        unsub,
        pub
    } = usePahoMQTTClient(uri, {
        onMessage: onMessage, onConnected: () => {
            subs.current.forEach(s => {
                sub(s).then().catch();
            });
        },
    }, options);

    useEffect(() => {
        c.current = connected;
    }, [connected]);

    const bind = useCallback((topic: RegExp | string, binder: Binding) => {
        let re: RegExp;
        if (typeof topic === 'string') {
            re = new RegExp(`^${topic}$`);
        } else {
            re = topic;
        }
        const key = re.toString().slice(1, -1);
        let binds = bindings.current.get(key);
        if (binds === undefined) {
            binds = [binder];
            bindings.current.set(key, binds);
            return;
        }
        if (binds.includes(binder)) {
            return;
        }
        binds.push(binder);
    }, []);

    const unbind = useCallback((binder: Binding) => {
        bindings.current.forEach((binds, key) => {
            const newBinds = binds.filter((b) => b !== binder);
            bindings.current.set(key, newBinds);
        });
    }, []);


    const bindExact = useCallback((topic: string, binder: Binding) => {
        let binds = exactBindings.current.get(topic);
        if (binds === undefined) {
            binds = [binder];
            exactBindings.current.set(topic, binds);
            return;
        }
        if (binds.includes(binder)) {
            return;
        }
        binds.push(binder);
    }, []);

    const unbindExact = useCallback((topic: string, binder: Binding) => {
        const binds = exactBindings.current.get(topic);
        if (binds === undefined) return;
        exactBindings.current.set(topic, binds.filter((b) => b !== binder));
    }, []);

    const updateSubs = useCallback((s: string[]) => {
        if (isEq(subs.current, s)) {
            return;
        }
        if (c.current) {
            unsubscribe(unsub, subs.current).then(() => {
                return subscribe(sub, s);
            });
        }
        subs.current = s;
    }, [sub, unsub]);

    return {
        setSubs: updateSubs,
        error,
        connected,
        bind,
        unbind,
        bindExact,
        unbindExact,
        pub,
    } as SimpleMQTT;
};
