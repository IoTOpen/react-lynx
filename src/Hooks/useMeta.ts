import {DependencyList, useCallback, useLayoutEffect, useState} from 'react';
import {MetaObject, WithMeta} from '@iotopen/node-lynx';

export type MetaElement = MetaObject & {
    key: string
}

export const useMeta = (obj?: WithMeta, deps?: DependencyList) => {
    const [metaList, setMetaList] = useState<MetaElement[]>([]);
    const depList = deps? deps: obj ? [obj]: [];

    useLayoutEffect(() => {
        if (obj) {
            const newList = [] as MetaElement[];
            for (const key in obj.meta) {
                const value = obj.meta[key];
                newList.push({key: key, value: value, protected: false});
            }
            for (const key in obj.protected_meta) {
                const value = obj.protected_meta[key];
                newList.push({key: key, value: value, protected: true});
            }
            newList.sort((a, b) => a.key.localeCompare(b.key));
            setMetaList(newList);
        }
    }, depList);

    const compile = useCallback(() => {
        const res = {meta: {}, protected_meta: {}} as WithMeta;
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
        setMetaList([...metaList, e ? e : {key: '', value: '', protected: false}]);
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
        setMetaList(metaList.map((x, i) => i == idx ? {...x, protected: value} : x));
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
