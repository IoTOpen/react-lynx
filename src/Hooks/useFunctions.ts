import { useCallback, useLayoutEffect, useState } from 'react';

import type { EmptyFunctionx, ErrorResponse, Functionx, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

export const useFunctions = (installationId: number | string, filter?: Metadata) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid) && iid !== undefined) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [functions, setFunctions] = useState<Functionx[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        if (iid === undefined) {
            setLoading(false);
            setFunctions([]);
            return;
        }
        setLoading(true);
        lynxClient.getFunctions(iid, filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setFunctions(res);
            return res;
        }).catch(e => {
            setError(e as ErrorResponse);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);

    function removeFn<T extends Functionx | Functionx[]>(fns: T): ObjectOrArray<OKResponse, Functionx, T>
    function removeFn(fns: Functionx | Functionx[]) {
        if (Array.isArray(fns)) {
            const last = fns.pop();
            if (!last) {return Promise.allSettled([]);}
            const rest = fns.map((f => {
                return lynxClient.deleteFunction(f, true);
            }));
            return Promise.allSettled(rest).then(async(settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.deleteFunction(last) });
                } catch (e) {
                    settled.push({ status: 'rejected', reason: e });
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
            if (!last) {return Promise.allSettled([]);}
            const rest = fns.map(f => {
                return lynxClient.createFunction(f, true);
            });
            return Promise.allSettled(rest).then(async(settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.createFunction(last) });
                } catch (e) {
                    settled.push({ status: 'rejected', reason: e });
                }
                return settled;
            });
        }
        return lynxClient.createFunction(fns);
    }

    // createFn/removeFn are overloaded; allow any args and result here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    const create = useCallback((...args: any[]) => (createFn as any)(...args), [createFn]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    const remove = useCallback((...args: any[]) => (removeFn as any)(...args), [removeFn]);

    useLayoutEffect(() => {
        void Promise.resolve().then(refreshCall);
    }, [refreshCall]);

    return {
        loading,
        error,
        create,
        remove,
        functions,
        refresh: refreshCall,
    };
};
