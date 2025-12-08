import { useCallback, useLayoutEffect, useState } from 'react';

import type { Devicex, ErrorResponse, MetaObject, OKResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

const zeroDevice = {
    updated: 0,
    created: 0,
    id: 0,
    installation_id: 0,
    type: '',
    meta: {},
    protected_meta: {}
};

export const useDevice = (installationId: number | string, deviceId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof deviceId === 'string' ? Number.parseInt(deviceId) : deviceId;
    if(isNaN(iid) || isNaN(id)) {
        throw new Error('invalid installationId or deviceId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [dev, setDev] = useState<Devicex>({ ...zeroDevice });
    const [error, setError] = useState<ErrorResponse | undefined>();

    useLayoutEffect(() => {
        lynxClient.getDevice(iid, id).then(fn => {
            setError((err) => err !== undefined ? undefined : err);
            setDev(fn);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, id]);

    const update = useCallback(() => {
        return new Promise<Devicex>(() => {
            if (!dev) {
                throw new Error('update on undefined function');
            }
            return lynxClient.updateDevice(dev);
        });
    }, [lynxClient, dev]);

    const setType = useCallback((t: string) => {
        if (dev) {setDev({ ...dev, type: t });}
    }, [dev, setDev]);

    const remove = useCallback(() => {
        return new Promise<OKResponse>(() => {
            if (!dev) {
                throw new Error('delete on undefined function');
            }
            return lynxClient.deleteDevice(dev);
        });
    }, [dev, lynxClient]);

    return {
        loading,
        error,
        Device: dev,
        setDevice: setDev,
        update,
        remove,
        setType,
    };
};

export const useDeviceMeta = (installationId: number | string, deviceId?: number|string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const devId = typeof deviceId === 'string' ? Number.parseInt(deviceId) : deviceId;

    const { lynxClient } = useGlobalLynxClient();

    const create = useCallback((key: string, meta: MetaObject, overrideDevId?: number, silent?: boolean) => {
    const id = overrideDevId ?? devId ?? 0;
        return lynxClient.createDeviceMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, devId]);


    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, overrideDevId?: number, silent?: boolean) => {
    const id = overrideDevId ?? devId ?? 0;
        return lynxClient.updateDeviceMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, devId]);


    const remove = useCallback((key: string, overrideDevId?: number, silent?: boolean) => {
    const id = overrideDevId ?? devId ?? 0;
        return lynxClient.deleteDeviceMeta(iid, id, key, silent);
    }, [lynxClient, iid, devId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
