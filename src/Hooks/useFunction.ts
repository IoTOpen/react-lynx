import { useCallback, useEffect, useState } from 'react';

import type { ErrorResponse, Functionx, MetaObject } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

import { parseResourceId } from './resourceId';

const zeroFunction = {
    id: 0,
    installation_id: 0,
    type: '',
    updated: 0,
    created: 0,
    meta: {},
    protected_meta: {}
};

export const useFunction = (installationId: number | string, functionId: number | string) => {
    const iid = parseResourceId(installationId, 'installationId');
    const id = parseResourceId(functionId, 'functionId');

    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [func, setFunc] = useState<Functionx>({ ...zeroFunction });
    const [error, setError] = useState<ErrorResponse | undefined>();

    useEffect(() => {
        let cancelled = false;

        void Promise.resolve().then(() => {
            if (cancelled) {return;}

            setLoading(true);
            setError(undefined);
            setFunc({ ...zeroFunction });

            void lynxClient.getFunction(iid, id).then(fn => {
                if (!cancelled) {
                    setFunc(fn);
                }
            }).catch((e: unknown) => {
                if (!cancelled) {
                    setError(e as ErrorResponse);
                }
            }).finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        });

        return () => {cancelled = true;};
    }, [lynxClient, iid, id]);

    const update = useCallback(() => {
        return lynxClient.updateFunction(func);
    }, [lynxClient, func]);

    const setType = useCallback((t: string) => {
        if (func) {setFunc({ ...func, type: t });}
    }, [func, setFunc]);

    const remove = useCallback(() => {
        return lynxClient.deleteFunction(func);
    }, [func, lynxClient]);

    return {
        loading,
        error,
        Function: func,
        setFunction: setFunc,
        update,
        remove,
        setType,
    };
};

export const useFunctionMeta = (installationId: number | string, functionId?: number | string) => {
    const iid = parseResourceId(installationId, 'installationId');
    const fnId = functionId === undefined ? undefined : parseResourceId(functionId, 'functionId');

    const { lynxClient } = useGlobalLynxClient();
    const create = useCallback((key: string, meta: MetaObject, funId?: number, silent?: boolean) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.createFunctionMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, fnId]);

    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, funId?: number, silent?: boolean) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.updateFunctionMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, fnId]);

    const remove = useCallback((key: string, funId?: number, silent?: boolean) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.deleteFunctionMeta(iid, id, key, silent);
    }, [lynxClient, iid, fnId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
