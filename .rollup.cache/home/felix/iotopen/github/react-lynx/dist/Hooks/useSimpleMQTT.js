import { useCallback, useEffect, useRef } from 'react';
import { usePahoMQTTClient } from './usePahoMQTTClient';
function isEq(a, b) {
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
async function unsubscribe(unsub, subs) {
    const promises = subs.map(async (topic) => {
        try {
            await unsub(topic);
        }
        catch (e) {
            // Log only valid Error objects, fallback to string otherwise
            if (e instanceof Error) {
                console.warn('failed to unsubscribe to', topic, e);
            }
            else {
                console.warn('failed to unsubscribe to', topic, String(e));
            }
        }
    });
    await Promise.all(promises);
}
async function subscribe(sub, subs) {
    const promises = subs.map(async (topic) => {
        try {
            await sub(topic);
        }
        catch (e) {
            if (e instanceof Error) {
                console.warn('failed to subscribe to', topic, e);
            }
            else {
                console.warn('failed to subscribe to', topic, String(e));
            }
        }
    });
    await Promise.all(promises);
}
export const useSimpleMQTT = (uri, username, password) => {
    if (uri === undefined) {
        if (window !== undefined) {
            uri = window.location.protocol === 'http:' ? `ws://${window.location.host}/mqtt` : `wss://${window.location.host}/mqtt`;
        }
        else {
            uri = location.protocol === 'http:' ? `ws://${location.host}/mqtt` : `wss://${location.host}/mqtt`;
        }
    }
    const subs = useRef([]);
    const bindings = useRef(new Map([]));
    const exactBindings = useRef(new Map([]));
    const onMessage = useCallback((msg) => {
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
    const c = useRef(false);
    const options = {
        cleanSession: true,
        reconnect: true,
        keepAliveInterval: 5,
    };
    if (username) {
        options.userName = username;
    }
    if (password) {
        options.password = password;
    }
    const { error, connected, sub, unsub, pub } = usePahoMQTTClient(uri, {
        onMessage: onMessage, onConnected: () => {
            // Re-subscribe to all topics upon connection.
            void subscribe(sub, subs.current).catch((e) => {
                if (e instanceof Error) {
                    console.error('#mqtt: Failed to re-subscribe on connect', e);
                }
                else {
                    console.error('#mqtt: Failed to re-subscribe on connect', String(e));
                }
            });
        },
    }, options);
    useEffect(() => {
        c.current = connected;
    }, [connected]);
    const bind = useCallback((topic, binder) => {
        let re;
        if (typeof topic === 'string') {
            re = new RegExp(`^${topic}$`);
        }
        else {
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
    const unbind = useCallback((binder) => {
        bindings.current.forEach((binds, key) => {
            const newBinds = binds.filter((b) => b !== binder);
            bindings.current.set(key, newBinds);
        });
    }, []);
    const bindExact = useCallback((topic, binder) => {
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
    const unbindExact = useCallback((topic, binder) => {
        const binds = exactBindings.current.get(topic);
        if (binds === undefined)
            return;
        exactBindings.current.set(topic, binds.filter((b) => b !== binder));
    }, []);
    const updateSubs = useCallback((s) => {
        if (isEq(subs.current, s)) {
            return;
        }
        if (c.current) {
            unsubscribe(unsub, subs.current)
                .then(() => subscribe(sub, s))
                .catch((e) => {
                if (e instanceof Error) {
                    console.error('#mqtt: Failed to update subscriptions', e);
                }
                else {
                    console.error('#mqtt: Failed to update subscriptions', String(e));
                }
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
    };
};
//# sourceMappingURL=useSimpleMQTT.js.map