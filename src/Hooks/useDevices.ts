import { useCallback, useLayoutEffect, useState } from 'react';

import type { Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import type { ObjectOrArray } from '../types';
import { isErrorResponse } from '../utils/errorHandling';

export const useDevices = (installationId: number | string, filter?: Metadata) => {
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
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);

    function removeFn<T extends Devicex | Devicex[]> (devs: T): ObjectOrArray<OKResponse, Devicex, T>
    function removeFn (devs: Devicex | Devicex[]) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last) {return Promise.allSettled([]);}
            const rest = devs.map((dev => lynxClient.deleteDevice(dev, true)));
            return Promise.allSettled(rest).then(async (settled) => {
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

    function createFn<T extends EmptyDevicex | EmptyDevicex[]> (devs: T): ObjectOrArray<Devicex, EmptyDevicex, T>
    function createFn (devs: EmptyDevicex | EmptyDevicex[]) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last) {return Promise.allSettled([]);}
            const rest = devs.map(dev => lynxClient.createDevice(dev, true));
            return Promise.allSettled(rest).then(async (settled) => {
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

    const create = createFn;
    const remove = removeFn;

    useLayoutEffect(() => {
        refreshCall();
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
