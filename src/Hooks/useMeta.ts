import { type DependencyList, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { MetaObject, WithMeta } from '@iotopen/node-lynx';

export type MetaElement = MetaObject & {
    key: string
}

const dependenciesChanged = (previous: DependencyList, current: DependencyList) => {
    return previous.length !== current.length || previous.some((value, index) => !Object.is(value, current[index]));
};

export const useMeta = (obj?: WithMeta, deps: DependencyList = []) => {
    const [metaList, setMetaList] = useState<MetaElement[]>([]);
    const previousInputs = useRef<{ obj: WithMeta | undefined; deps: DependencyList } | undefined>(undefined);
    const updateVersion = useRef(0);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {mounted.current = false;};
    }, []);

    useLayoutEffect(() => {
        const previous = previousInputs.current;
        if (previous !== undefined && previous.obj === obj && !dependenciesChanged(previous.deps, deps)) {
            return;
        }

        previousInputs.current = { obj, deps: [...deps] };
        const version = ++updateVersion.current;

        if (obj) {
            const newList = [] as MetaElement[];
            for (const key in obj.meta) {
                const value = obj.meta[key];
                newList.push({ key, value: value ?? '', protected: false });
            }
            for (const key in obj.protected_meta) {
                const value = obj.protected_meta[key];
                newList.push({ key, value: value ?? '', protected: true });
            }
            newList.sort((a, b) => a.key.localeCompare(b.key));
            void Promise.resolve().then(() => {
                if (mounted.current && version === updateVersion.current) {
                    setMetaList(newList);
                }
            });
        }
    });

    const compile = useCallback(() => {
        const res: WithMeta = { meta: {}, protected_meta: {} };
        metaList.forEach((e) => {
            if (e.protected) {
                res.protected_meta[e.key] = e.value;
            } else {
                res.meta[e.key] = e.value;
            }
        });
        return res;
    }, [metaList]);

    const add = useCallback((e?: MetaElement) => {
        setMetaList([...metaList, e ?? { key: '', value: '', protected: false }]);
    }, [metaList, setMetaList]);

    const remove = useCallback((idx: number) => {
        setMetaList(metaList.filter((_, i) => i !== idx));
    }, [metaList, setMetaList]);

    const update = useCallback((idx: number, e: MetaElement) => {
        setMetaList(metaList.map((x, i) => i === idx ? e : x));
    }, [metaList, setMetaList]);

    const setKey = useCallback((idx: number, key: string) => {
        setMetaList(metaList.map((x, i) => i === idx ? { ...x, key } : x));
    }, [metaList, setMetaList]);

    const setValue = useCallback((idx: number, value: string) => {
        setMetaList(metaList.map((x, i) => i === idx ? { ...x, value } : x));
    }, [metaList, setMetaList]);

    const setProtected = useCallback((idx: number, value: boolean) => {
        setMetaList(metaList.map((x, i) => i === idx ? { ...x, protected: value } : x));
    }, [metaList, setMetaList]);

    return {
        metaList,
        compile,
        addMeta: add,
        removeMeta: remove,
        setMeta: update,
        setMetaKey: setKey,
        setMetaValue: setValue,
        setMetaProtected: setProtected,
    };
};
