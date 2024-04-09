import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {ErrorResponse, Functionx, MetaObject, OKResponse} from '@iotopen/node-lynx';

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
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof functionId === 'string' ? Number.parseInt(functionId) : functionId;

    if (isNaN(iid) || isNaN(id)) {
        throw new Error('invalid installationId or functionId');
    }

    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [func, setFunc] = useState<Functionx>({...zeroFunction});
    const [error, setError] = useState<ErrorResponse | undefined>();

    useLayoutEffect(() => {
        lynxClient.getFunction(iid, id).then(fn => {
            setError((err) => err !== undefined ? undefined : err);
            setFunc(fn);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, id]);

    const update = useCallback(() => {
        return new Promise<Functionx>(() => {
            if (!func) {
                throw new Error('update on undefined function');
            }
            return lynxClient.updateFunction(func);
        });
    }, [lynxClient, func]);

    const setType = useCallback((t: string) => {
        if (func) setFunc({...func, type: t});
    }, [func, setFunc]);

    const remove = useCallback(() => {
        return new Promise<OKResponse>(() => {
            if (!func) {
                throw new Error('delete on undefined function');
            }
            return lynxClient.deleteFunction(func);
        });
    }, [func, lynxClient]);

    return {
        loading: loading,
        error: error,
        Function: func,
        setFunction: setFunc,
        update: update,
        remove: remove,
        setType: setType,
    };
};

export const useFunctionMeta = (installationId: number | string, functionId?: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const fnId = typeof functionId === 'string' ? Number.parseInt(functionId) : functionId;

    const {lynxClient} = useGlobalLynxClient();
    const create = useCallback((key: string, meta: MetaObject, funId?: number, silent?: boolean) => {
        const id = funId ? funId : fnId ?? 0;
        return lynxClient.createFunctionMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, fnId]);

    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, funId?: number, silent?: boolean) => {
        const id = funId ? funId : fnId ?? 0;
        return lynxClient.updateFunctionMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, fnId]);

    const remove = useCallback((key: string, funId?: number, silent?: boolean) => {
        const id = funId ? funId : fnId ?? 0;
        return lynxClient.deleteFunctionMeta(iid, id, key, silent);
    }, [lynxClient, iid, fnId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
