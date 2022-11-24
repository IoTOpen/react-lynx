import {useCallback, useLayoutEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {Devicex, EmptyDevicex, ErrorResponse, Metadata} from '@iotopen/node-lynx';

export const useDevices = (installationId: number, filter?: Metadata) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<Devicex[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refreshCall = useCallback(() => {
        setLoading(true);
        lynxClient.getDevices(installationId, filter).then(res => {
            if (error !== undefined) setError(undefined);
            setDevices(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient, installationId, filter]);

    const remove = useCallback((dev: Devicex[]) => {
        const last = dev.pop();
        if (!last) return Promise.allSettled([]);
        const rest = dev.map((f => {
            return lynxClient.deleteDevice(f, true);
        }));
        return Promise.allSettled(rest).then(async (settled) => {
            try {
                settled.push({status: 'fulfilled', value: await lynxClient.deleteDevice(last)});
            } catch (e) {
                settled.push({status: 'rejected', reason: e});
            }
            return settled;
        });
    }, [lynxClient]);

    const create = useCallback((dev: EmptyDevicex[]) => {
        const last = dev.pop();
        if (!last) return Promise.allSettled([]);
        const rest = dev.map(f => {
            return lynxClient.createFunction(f, true);
        });
        return Promise.allSettled(rest).then(async (settled) => {
            try {
                settled.push({status: 'fulfilled', value: await lynxClient.createDevice(last)});
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
        devices: devices,
        refresh: refreshCall,
    };
};
