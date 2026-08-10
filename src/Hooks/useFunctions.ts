import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EmptyFunctionx, ErrorResponse, Functionx, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

import { parseResourceId } from './resourceId';

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
    const iid = installationId === undefined ? undefined : parseResourceId(installationId, 'installationId');

    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [functions, setFunctions] = useState<Functionx[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const latestRequest = useRef(0);

    // Stable string primitive to prevent infinite re-renders on object literal inputs
    const filterKey = filter ? JSON.stringify(filter) : undefined;
    const stableFilter = useMemo(
        () => filterKey === undefined ? undefined : JSON.parse(filterKey) as Metadata,
        [filterKey],
    );

    const refreshCall = useCallback((resetData = false) => {
        const request = ++latestRequest.current;

        void Promise.resolve().then(() => {
            if (request !== latestRequest.current) {return;}

            setLoading(true);
            setError(undefined);
            if (resetData) {
                setFunctions([]);
            }

            if (iid === undefined) {
                setLoading(false);
                setFunctions([]);
                return;
            }

            void lynxClient.getFunctions(iid, stableFilter)
                .then(res => {
                    if (request === latestRequest.current) {
                        setFunctions(res);
                    }
                })
                .catch((e: unknown) => {
                    if (request === latestRequest.current) {
                        setError(e as ErrorResponse);
                    }
                })
                .finally(() => {
                    if (request === latestRequest.current) {
                        setLoading(false);
                    }
                });
        });

        return () => {latestRequest.current += 1;};
    }, [lynxClient, iid, stableFilter]);

    // Typed via 'as unknown as' to support the inline function expression requirement of the React Compiler with zero 'any' types
    const remove = useCallback((fns: Functionx | Functionx[]) => {
        if (Array.isArray(fns)) {
            if (fns.length === 0) {return Promise.allSettled([]);}

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
        const cancel = refreshCall(true);
        return cancel;
    }, [refreshCall]);

    const refresh = useCallback(() => {
        void refreshCall();
    }, [refreshCall]);

    return {
        loading,
        error,
        create,
        remove,
        functions,
        refresh,
    };
};
