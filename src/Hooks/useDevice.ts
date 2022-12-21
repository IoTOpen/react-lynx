import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {Devicex, ErrorResponse, MetaObject, OKResponse} from '@iotopen/node-lynx';
import {useMeta} from './useMeta';

export const useDevice = (installationId: number, deviceId: number) => {
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
        lynxClient.getDevice(installationId, deviceId).then(fn => {
            if (error !== undefined) setError(undefined);
            setDev(fn);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, installationId, deviceId]);

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

export const useDeviceMeta = (installationId: number, deviceId?: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const create = useCallback((key: string, meta: MetaObject, devId?: number, silent?: boolean) => {
        const id = devId ? devId : deviceId ?? 0;
        return lynxClient.createDeviceMeta(installationId, id, key, meta, silent);
    }, [lynxClient, installationId, deviceId]);

    const update = useCallback((key: string, meta: MetaObject, createMissing?: boolean, devId?: number, silent?: boolean) => {
        const id = devId ? devId : deviceId ?? 0;
        return lynxClient.updateDeviceMeta(installationId, id, key, meta, silent, createMissing);
    }, [lynxClient, installationId, deviceId]);

    const remove = useCallback((key: string, devId?: number, silent?: boolean) => {
        const id = devId ? devId : deviceId ?? 0;
        return lynxClient.deleteDeviceMeta(installationId, id, key, silent);
    }, [lynxClient, installationId, deviceId]);

    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
