import { useCallback, useLayoutEffect, useState } from 'react';
export const useMeta = (obj, deps) => {
    const [metaList, setMetaList] = useState([]);
    const depList = deps ? deps : obj ? [obj] : [];
    useLayoutEffect(() => {
        if (obj) {
            const newList = [];
            for (const key in obj.meta) {
                const value = obj.meta[key];
                newList.push({ key: key, value: value, protected: false });
            }
            for (const key in obj.protected_meta) {
                const value = obj.protected_meta[key];
                newList.push({ key: key, value: value, protected: true });
            }
            newList.sort((a, b) => a.key.localeCompare(b.key));
            setMetaList(newList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, depList);
    const compile = useCallback(() => {
        const res = { meta: {}, protected_meta: {} };
        metaList.forEach((e) => {
            if (e.protected) {
                res.protected_meta[e.key] = e.value;
            }
            else {
                res.meta[e.key] = e.value;
            }
        });
        return res;
    }, [metaList]);
    const add = useCallback((e) => {
        setMetaList([...metaList, e ? e : { key: '', value: '', protected: false }]);
    }, [metaList, setMetaList]);
    const remove = useCallback((idx) => {
        setMetaList(metaList.filter((_, i) => i !== idx));
    }, [metaList, setMetaList]);
    const update = useCallback((idx, e) => {
        setMetaList(metaList.map((x, i) => i === idx ? e : x));
    }, [metaList, setMetaList]);
    const setKey = useCallback((idx, key) => {
        setMetaList(metaList.map((x, i) => i == idx ? { ...x, key: key } : x));
    }, [metaList, setMetaList]);
    const setValue = useCallback((idx, value) => {
        setMetaList(metaList.map((x, i) => i == idx ? { ...x, value: value } : x));
    }, [metaList, setMetaList]);
    const setProtected = useCallback((idx, value) => {
        setMetaList(metaList.map((x, i) => i == idx ? { ...x, protected: value } : x));
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
//# sourceMappingURL=useMeta.js.map