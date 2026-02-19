import { useCallback, useLayoutEffect, useState } from 'react';

import type { Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';

export const useDevices = (installationId: number|string, filter?: Metadata) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid) && iid !== undefined) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<Devicex[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        if (iid === undefined) {
            setLoading(false);
            setDevices([]);
            return;
        }
        setLoading(true);
        lynxClient.getDevices(iid, filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setDevices(res);
        }).catch(e => {
            setError(e as ErrorResponse);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);

    function removeFn<T extends Devicex | Devicex[]>(devs: T): ObjectOrArray<OKResponse, Devicex, T>
    function removeFn(devs: Devicex | Devicex[]) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last) {return Promise.allSettled([]);}
            const rest = devs.map((dev => {
                return lynxClient.deleteDevice(dev, true);
            }));
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
    }

    function createFn<T extends EmptyDevicex | EmptyDevicex[]>(devs: T): ObjectOrArray<Devicex, EmptyDevicex, T>
    function createFn(devs: EmptyDevicex | EmptyDevicex[]) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last) {return Promise.allSettled([]);}
            const rest = devs.map(dev => {
                return lynxClient.createDevice(dev, true);
            });
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
        devices,
        refresh: refreshCall,
    };
};
