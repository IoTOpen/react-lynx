import { useCallback, useEffect, useRef } from 'react';

import type { ConnectionOptions, Message, MQTTError, Qos, TypedArray } from 'paho-mqtt';

import { usePahoMQTTClient } from './usePahoMQTTClient';

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

type Unsub = (topic: string) => Promise<void>;

async function unsubscribe(unsub: Unsub, subs: string[]): Promise<void> {
    await Promise.all(subs.map(async(topic) => {
        try {
            await unsub(topic);
        } catch (e) {
            console.warn('failed to unsubscribe to', topic, e);
        }
    }));
}

async function subscribe(sub: (topic: string, qos?: Qos) => Promise<Qos>, subs: string[]): Promise<void> {
    await Promise.all(subs.map(async(topic) => {
        try {
            await sub(topic);
        } catch (e) {
            console.warn('failed to subscribe to', topic, e);
        }
    }));
}

export interface SimpleMQTT {
    setSubs: (subscriptions: string[]) => void;
    error?: MQTTError;
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
    const activeSubs = useRef<string[]>([]);
    const pendingSubscriptionUpdates = useRef(Promise.resolve());
    const bindings = useRef(new Map<string, Binding[]>([]));
    const exactBindings = useRef(new Map<string, Binding[]>([]));
    const onMessage = useCallback((msg: Message) => {
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
    } as ConnectionOptions;
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
        onMessage, onConnected: () => {
            c.current = true;
            const nextSubs = [...subs.current];
            const update = pendingSubscriptionUpdates.current.then(async() => {
                activeSubs.current = [];
                await subscribe(sub, nextSubs);
                activeSubs.current = nextSubs;
            }).catch((e) => {
                console.warn('Failed to restore subscriptions', e);
            });
            pendingSubscriptionUpdates.current = update;
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
        if (binds === undefined) {return;}
        exactBindings.current.set(topic, binds.filter((b) => b !== binder));
    }, []);

    const updateSubs = useCallback((s: string[]): Promise<void> => {
        const nextSubs = [...s];
        if (isEq(subs.current, nextSubs)) {
            return pendingSubscriptionUpdates.current;
        }
        subs.current = nextSubs;

        const update = pendingSubscriptionUpdates.current.then(async() => {
            if (!c.current) {
                return;
            }
            await unsubscribe(unsub, activeSubs.current);
            activeSubs.current = [];
            if (!isEq(subs.current, nextSubs)) {
                return;
            }
            await subscribe(sub, nextSubs);
            activeSubs.current = nextSubs;
        })
            .catch((e) => {
                console.warn('Failed to update subscriptions', e);
            });
        pendingSubscriptionUpdates.current = update;
        return update;
    }, [sub, unsub]);

    const setSubs = useCallback((s: string[]): void => {
        void updateSubs(s);
    }, [updateSubs]);

    return {
        setSubs,
        error,
        connected,
        bind,
        unbind,
        bindExact,
        unbindExact,
        pub,
    } as SimpleMQTT;
};
