import { useCallback, useEffect, useState } from 'react';

import type { Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

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
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId, 10) : installationId;

    if (installationId !== undefined && Number.isNaN(iid)) {
        throw new Error('invalid installationId');
    }

    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<Devicex[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    const filterKey = filter ? JSON.stringify(filter) : undefined;

    const refreshCall = useCallback(() => {
        let cancelled = false;

        if (iid === undefined) {
            void Promise.resolve().then(() => {
                if (!cancelled) {
                    setLoading(false);
                    setDevices([]);
                }
            });
            return () => { cancelled = true; };
        }

        void Promise.resolve().then(() => {
            if (cancelled) {return;}

            setLoading(true);

            void lynxClient.getDevices(iid, filter)
                .then(res => {
                    if (!cancelled) {
                        setError(prev => (prev !== undefined ? undefined : prev));
                        setDevices(res);
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
        const cancel = refreshCall();
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
