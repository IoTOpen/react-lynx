import { useCallback, useEffect, useState } from 'react';

import type { EmptyFunctionx, ErrorResponse, Functionx, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

interface RemoveFunctionFn {
    <T extends Functionx | Functionx[]>(fns: T): ObjectOrArray<OKResponse, Functionx, T>;
}

interface CreateFunctionFn {
    <T extends EmptyFunctionx | EmptyFunctionx[]>(fns: T): ObjectOrArray<Functionx, EmptyFunctionx, T>;
}

/**
 * @param installationId The installation ID.
 * @param filter Optional metadata filter. Note: Consumers should memoize this object or rely on its JSON representation being stable.
 */
export const useFunctions = (installationId: number | string, filter?: Metadata) => {
    // Supplied radix 10 to prevent unexpected parsing behaviors
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId, 10) : installationId;

    // Strict number checking and consolidated undefined evaluation
    if (installationId !== undefined && Number.isNaN(iid)) {
        throw new Error('invalid installationId');
    }

    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [functions, setFunctions] = useState<Functionx[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    // Stable string primitive to prevent infinite re-renders on object literal inputs
    const filterKey = filter ? JSON.stringify(filter) : undefined;

    const refreshCall = useCallback(() => {
        let cancelled = false;

        if (iid === undefined) {
            // Defer execution to a microtask to avoid synchronous cascading renders, marking the promise void
            void Promise.resolve().then(() => {
                if (!cancelled) {
                    setLoading(false);
                    setFunctions([]);
                }
            });
            return () => { cancelled = true; };
        }

        // Push state mutations out of the synchronous render phase to support the React Compiler
        void Promise.resolve().then(() => {
            if (cancelled) {return;}
            setLoading(true);

            void lynxClient.getFunctions(iid, filter)
                .then(res => {
                    if (!cancelled) {
                        setError(prev => (prev !== undefined ? undefined : prev));
                        setFunctions(res);
                    }
                })
                .catch((e: unknown) => {
                    if (!cancelled) {
                        setError(e as ErrorResponse);
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        });

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient, iid, filterKey]);

    // Typed via 'as unknown as' to support the inline function expression requirement of the React Compiler with zero 'any' types
    const remove = useCallback((fns: Functionx | Functionx[]) => {
        if (Array.isArray(fns)) {
            if (fns.length === 0) {return Promise.allSettled([]);}

            // Replaced .pop() mutation with strict index lookup (!) to clear noUncheckedIndexedAccess rules
            const last = fns[fns.length - 1]!;
            const rest = fns.slice(0, -1).map(f => lynxClient.deleteFunction(f, true));

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
    }, [lynxClient]) as unknown as RemoveFunctionFn;

    // Typed via 'as unknown as' to support the inline function expression requirement of the React Compiler with zero 'any' types
    const create = useCallback((fns: EmptyFunctionx | EmptyFunctionx[]) => {
        if (Array.isArray(fns)) {
            if (fns.length === 0) {return Promise.allSettled([]);}

            // Replaced .pop() mutation with strict index lookup (!) to clear noUncheckedIndexedAccess rules
            const last = fns[fns.length - 1]!;
            const rest = fns.slice(0, -1).map(f => lynxClient.createFunction(f, true));

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
    }, [lynxClient]) as unknown as CreateFunctionFn;

    useEffect(() => {
        const cancel = refreshCall();
        return cancel;
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
