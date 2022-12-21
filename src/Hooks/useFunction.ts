import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {ErrorResponse, Functionx, MetaObject, OKResponse} from '@iotopen/node-lynx';
import {useMeta} from './useMeta';

export const useFunction = (installationId: number, functionId: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [func, setFunc] = useState<Functionx>({
        id: 0,
        installation_id: 0,
        type: '',
        updated: 0,
        created: 0,
        meta: {},
        protected_meta: {}
    });
    const {
        metaList,
        setMeta,
        removeMeta,
        compile,
        setMetaKey,
        addMeta,
        setMetaValue,
        setMetaProtected
    } = useMeta(func, [loading]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    useLayoutEffect(() => {
        lynxClient.getFunction(installationId, functionId).then(fn => {
            if (error !== undefined) setError(undefined);
            setFunc(fn);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, installationId, functionId]);

    useLayoutEffect(() => {
        if (func) setFunc({...func, ...compile()});
    }, [func, metaList, setFunc]);

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
        update: update,
        remove: remove,
        setType: setType,
        metaList: metaList,
        setMeta: setMeta,
        addMeta: addMeta,
        removeMeta: removeMeta,
        setMetaKey: setMetaKey,
        setMetaValue: setMetaValue,
        setMetaProtected: setMetaProtected,
    };
};

export const useFunctionMeta = (installationId: number, functionId?: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const create = useCallback((key: string, meta: MetaObject, funId?: number, silent?: boolean) => {
        const id = funId ? funId : functionId ?? 0;
        return lynxClient.createFunctionMeta(installationId, id, key, meta, silent);
    }, [lynxClient, installationId, functionId]);

    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, funId?: number, silent?: boolean) => {
        const id = funId ? funId : functionId ?? 0;
        return lynxClient.updateFunctionMeta(installationId, id, key, meta, silent, createMissing);
    }, [lynxClient, installationId, functionId]);

    const remove = useCallback((key: string, funId?: number, silent?: boolean) => {
        const id = funId ? funId : functionId ?? 0;
        return lynxClient.deleteFunctionMeta(installationId, id, key, silent);
    }, [lynxClient, installationId, functionId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
