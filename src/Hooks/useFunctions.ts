import {useCallback, useLayoutEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {EmptyFunctionx, ErrorResponse, Functionx, Metadata, OKResponse} from '@iotopen/node-lynx';
import {ObjectOrArray} from '../types';

export const useFunctions = (installationId: number | string, filter?: Metadata) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [functions, setFunctions] = useState<Functionx[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        setLoading(true);
        lynxClient.getFunctions(iid, filter).then(res => {
            if (error !== undefined) setError(undefined);
            setFunctions(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);

    function removeFn<T extends Functionx | Functionx[]>(fns: T): ObjectOrArray<OKResponse, Functionx, T>
    function removeFn(fns: Functionx | Functionx[]) {
        if (Array.isArray(fns)) {
            const last = fns.pop();
            if (!last) return Promise.allSettled([]);
            const rest = fns.map((f => {
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
        }
        return lynxClient.deleteFunction(fns);
    }

    function createFn<T extends EmptyFunctionx | EmptyFunctionx[]>(fns: T): ObjectOrArray<Functionx, EmptyFunctionx, T>
    function createFn(fns: EmptyFunctionx | EmptyFunctionx[]) {
        if (Array.isArray(fns)) {
            const last = fns.pop();
            if (!last) return Promise.allSettled([]);
            const rest = fns.map(f => {
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
        }
        return lynxClient.createFunction(fns);
    }

    const create = useCallback(createFn, [lynxClient]);
    const remove = useCallback(removeFn, [lynxClient]);

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
