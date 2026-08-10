import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

import { parseResourceId } from './resourceId';

interface RemoveDeviceFn {
    <T extends Devicex | Devicex[]>(devs: T): ObjectOrArray<OKResponse, Devicex, T>;
}

interface CreateDeviceFn {
    <T extends EmptyDevicex | EmptyDevicex[]>(devs: T): ObjectOrArray<Devicex, EmptyDevicex, T>;
}

/**
 * @param installationId The installation ID.
 * @param filter Optional metadata filter. Note: Consumers should memoize this object or rely on its JSON representation being stable.
 */
export const useDevices = (installationId: number | string, filter?: Metadata) => {
    const iid = installationId === undefined ? undefined : parseResourceId(installationId, 'installationId');

    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<Devicex[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const latestRequest = useRef(0);

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
                setDevices([]);
            }

            if (iid === undefined) {
                setLoading(false);
                setDevices([]);
                return;
            }

            void lynxClient.getDevices(iid, stableFilter)
                .then(res => {
                    if (request === latestRequest.current) {
                        setDevices(res);
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

    const remove = useCallback((devs: Devicex | Devicex[]) => {
        if (Array.isArray(devs)) {
            if (devs.length === 0) {return Promise.allSettled([]);}

            const last = devs[devs.length - 1]!;
            const rest = devs.slice(0, -1).map((dev => lynxClient.deleteDevice(dev, true)));

            return Promise.allSettled(rest).then(async(settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.deleteDevice(last) });
                } catch (e) {
                    settled.push({ status: 'rejected', reason: e });
                }
                return settled;
            });
        }
        return lynxClient.deleteDevice(devs);
    }, [lynxClient]) as unknown as RemoveDeviceFn;

    const create = useCallback((devs: EmptyDevicex | EmptyDevicex[]) => {
        if (Array.isArray(devs)) {
            if (devs.length === 0) {return Promise.allSettled([]);}

            const last = devs[devs.length - 1]!;
            const rest = devs.slice(0, -1).map(dev => lynxClient.createDevice(dev, true));

            return Promise.allSettled(rest).then(async(settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.createDevice(last) });
                } catch (e) {
                    settled.push({ status: 'rejected', reason: e });
                }
                return settled;
            });
        }
        return lynxClient.createDevice(devs);
    }, [lynxClient]) as unknown as CreateDeviceFn;

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
        devices,
        refresh,
    };
};
