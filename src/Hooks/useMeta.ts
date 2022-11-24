import {Metadata} from '@iotopen/node-lynx';
import {DependencyList, useCallback, useLayoutEffect, useState} from 'react';

export type MetaElement = {
    key: string
    value: string
    protect: boolean
}

export interface MetaLike {
    meta: Metadata;
    protected_meta: Metadata;
}

export const useMeta = (obj?: MetaLike, deps?: DependencyList) => {
    const [metaList, setMetaList] = useState<MetaElement[]>([]);
    const depList = deps? deps: obj ? [obj]: [];

    useLayoutEffect(() => {
        if (obj) {
            const newList = [] as MetaElement[];
            for (const key in obj.meta) {
                const value = obj.meta[key];
                newList.push({key: key, value: value, protect: false});
            }
            for (const key in obj.protected_meta) {
                const value = obj.protected_meta[key];
                newList.push({key: key, value: value, protect: true});
            }
            newList.sort((a, b) => a.key.localeCompare(b.key));
            setMetaList(newList);
        }
    }, depList);

    const compile = useCallback(() => {
        const res = {meta: {}, protected_meta: {}} as MetaLike;
        metaList.forEach((e) => {
            if (e.protect) {
                res.protected_meta[e.key] = e.value;
            } else {
                res.meta[e.key] = e.value;
            }
        });
        return res;
    }, [metaList]);

    const add = useCallback((e?: MetaElement) => {
        setMetaList([...metaList, e ? e : {key: '', value: '', protect: false}]);
    }, [metaList, setMetaList]);

    const remove = useCallback((idx: number) => {
        setMetaList(metaList.filter((_, i) => i !== idx));
    }, [metaList, setMetaList]);

    const update = useCallback((idx: number, e: MetaElement) => {
        setMetaList(metaList.map((x, i) => i === idx ? e : x));
    }, [metaList, setMetaList]);

    const setKey = useCallback((idx: number, key: string) => {
        setMetaList(metaList.map((x, i) => i == idx ? {...x, key: key} : x));
    }, [metaList, setMetaList]);

    const setValue = useCallback((idx: number, value: string) => {
        setMetaList(metaList.map((x, i) => i == idx ? {...x, value: value} : x));
    }, [metaList, setMetaList]);

    const setProtected = useCallback((idx: number, value: boolean) => {
        setMetaList(metaList.map((x, i) => i == idx ? {...x, protect: value} : x));
    }, [metaList, setMetaList]);

    return {
        metaList: metaList,
        compile: compile,
        addMeta: add,
        removeMeta: remove,
        setMeta: update,
        setMetaKey: setKey,
        setMetaValue: setValue,
        setMetaProtected: setProtected,
    };
};
