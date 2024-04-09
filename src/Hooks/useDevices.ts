import {useCallback, useLayoutEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse} from '@iotopen/node-lynx';
import {ObjectOrArray} from '../types';

export const useDevices = (installationId: number|string, filter?: Metadata) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if(isNaN(iid) && iid !== undefined) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<Devicex[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        if(iid === undefined) {
            setLoading(false);
            setDevices([]);
            return;
        }
        setLoading(true);
        lynxClient.getDevices(iid, filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setDevices(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);

    function removeFn<T extends Devicex | Devicex[]>(devs: T): ObjectOrArray<OKResponse, Devicex, T>
    function removeFn(devs: Devicex | Devicex[]) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last) return Promise.allSettled([]);
            const rest = devs.map((dev => {
                return lynxClient.deleteDevice(dev, true);
            }));
            return Promise.allSettled(rest).then(async (settled) => {
                try {
                    settled.push({status: 'fulfilled', value: await lynxClient.deleteDevice(last)});
                } catch (e) {
                    settled.push({status: 'rejected', reason: e});
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
            if (!last) return Promise.allSettled([]);
            const rest = devs.map(dev => {
                return lynxClient.createDevice(dev, true);
            });
            return Promise.allSettled(rest).then(async (settled) => {
                try {
                    settled.push({status: 'fulfilled', value: await lynxClient.createDevice(last)});
                } catch (e) {
                    settled.push({status: 'rejected', reason: e});
                }
                return settled;
            });
        }
        return lynxClient.createDevice(devs);
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
        devices: devices,
        refresh: refreshCall,
    };
};
