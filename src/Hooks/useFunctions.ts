import {useCallback, useLayoutEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {EmptyFunctionx, ErrorResponse, Functionx, Metadata} from '@iotopen/node-lynx';

export const useFunctions = (installationId: number, filter?: Metadata) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [functions, setFunctions] = useState<Functionx[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        setLoading(true);
        lynxClient.getFunctions(installationId, filter).then(res => {
            if (error !== undefined) setError(undefined);
            setFunctions(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient, installationId, filter]);

    const remove = useCallback((fn: Functionx[]) => {
        const last = fn.pop();
        if (!last) return Promise.allSettled([]);
        const rest = fn.map((f => {
            return lynxClient.deleteFunction(f, true);
        }));
        return Promise.allSettled(rest).then(async (settled) => {
            try {
                settled.push({status: 'fulfilled', value: await lynxClient.deleteFunction(last)});
            } catch (e) {
                settled.push({status: 'rejected', reason: e});
            }
            return settled;
        });
    }, [lynxClient]);

    const create = useCallback((fn: EmptyFunctionx[]) => {
        const last = fn.pop();
        if (!last) return Promise.allSettled([]);
        const rest = fn.map(f => {
            return lynxClient.createFunction(f, true);
        });
        return Promise.allSettled(rest).then(async (settled) => {
            try {
                settled.push({status: 'fulfilled', value: await lynxClient.createFunction(last)});
            } catch (e) {
                settled.push({status: 'rejected', reason: e});
            }
            return settled;
        });
    }, [lynxClient]);

    useLayoutEffect(() => {
        refreshCall();
    }, [refreshCall]);

    return {
        loading: loading,
        error: error,
        create: create,
        remove: remove,
        functions: functions,
        refresh: refreshCall,
    };
};
