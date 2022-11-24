import {usePahoMQTTClient} from './usePahoMQTTClient';
import {useCallback, useRef} from 'react';
import Paho, {Qos} from 'paho-mqtt';

export type Binding = (topic: string, payload: string, qos: Qos, retained: boolean) => void;

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

function unsubscribe(unsub: (topic: string) => void, subs: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
        subs.forEach(async (s) => {
            try {
                await unsub(s);
            } catch (e) {
                console.log(e);
            }
        });
        resolve();
    });
}

function subscribe(sub: (topic: string, qos?: Qos) => void, subs: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
        subs.forEach(async (s) => {
            try {
                await sub(s);
            } catch (e) {
                console.log(e);
            }
        });
        resolve();
    });
}

export const useSimpleMQTT = (uri?: string, username?: string, password?: string) => {
    if (uri === undefined) {
        uri = location.protocol === 'http:' ? `ws://${location.host}/mqtt` : `wss://${location.host}/mqtt`;
    }
    const subs = useRef<string[]>([]);
    const bindings = useRef(new Map<string, Binding[]>([]));
    const onMessage = useCallback((msg: Paho.Message) => {
        bindings.current.forEach((binds, key) => {
            const re = new RegExp(key);
            if (re.test(msg.destinationName)) {
                binds.forEach(cb => {
                    cb(msg.destinationName, msg.payloadString, msg.qos, msg.retained);
                });
            }
        });
    }, []);

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
        }
    }, options);

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

    const updateSubs = useCallback((s: string[]) => {
        if (isEq(subs.current, s)) {
            return;
        }
        if (connected) {
            unsubscribe(unsub, subs.current).then(() => {
                subscribe(sub, s).then().catch();
            }).catch();
        }
        subs.current = s;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sub, unsub]);

    return {
        error: error,
        connected: connected,
        setSubs: updateSubs,
        bind: bind,
        unbind: unbind,
        pub: pub,
    };
};
