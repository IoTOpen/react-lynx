import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {Devicex, ErrorResponse, MetaObject, OKResponse} from '@iotopen/node-lynx';
import {useMeta} from './useMeta';

export const useDevice = (installationId: number | string, deviceID: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof deviceID === 'string' ? Number.parseInt(deviceID) : deviceID;
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [dev, setDev] = useState<Devicex>({
        updated: 0,
        created: 0,
        id: 0,
        installation_id: 0,
        type: '',
        meta: {},
        protected_meta: {}
    });
    const {
        metaList,
        setMeta,
        removeMeta,
        compile,
        setMetaKey,
        addMeta,
        setMetaValue,
        setMetaProtected
    } = useMeta(dev, [loading]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    useLayoutEffect(() => {
        lynxClient.getDevice(iid, id).then(fn => {
            if (error !== undefined) setError(undefined);
            setDev(fn);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, id]);

    useLayoutEffect(() => {
        if (dev) setDev({...dev, ...compile()});
    }, [dev, metaList, setDev]);

    const update = useCallback(() => {
        return new Promise<Devicex>(() => {
            if (!dev) {
                throw new Error('update on undefined function');
            }
            return lynxClient.updateDevice(dev);
        });
    }, [lynxClient, dev]);

    const setType = useCallback((t: string) => {
        if (dev) setDev({...dev, type: t});
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
        loading: loading,
        error: error,
        Device: dev,
        setDevice: setDev,
        update: update,
        remove: remove,
        setType: setType,
        metaList: metaList,
        setMeta: setMeta,
        addMeta: addMeta,
        removeMeta: removeMeta,
        setMetaKey: setMetaKey,
        setMetaValue: setMetaValue,
        setMetaProtected: setMetaProtected,
    };
};

export const useDeviceMeta = (installationId: number | string, deviceId?: number|string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const devId = typeof deviceId === 'string' ? Number.parseInt(deviceId) : deviceId;

    const {lynxClient} = useGlobalLynxClient();
    const create = useCallback((key: string, meta: MetaObject, devId?: number, silent?: boolean) => {
        const id = devId ? devId : devId ?? 0;
        return lynxClient.createDeviceMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, devId]);

    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, devId?: number, silent?: boolean) => {
        const id = devId ? devId : devId ?? 0;
        return lynxClient.updateDeviceMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, devId]);

    const remove = useCallback((key: string, devId?: number, silent?: boolean) => {
        const id = devId ? devId : devId ?? 0;
        return lynxClient.deleteDeviceMeta(iid, id, key, silent);
    }, [lynxClient, iid, devId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
