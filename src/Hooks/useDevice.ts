import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {Devicex, ErrorResponse, OKResponse} from '@iotopen/node-lynx';
import {useMeta} from './useMeta';

export const useDevice = (installationId: number, deviceId: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [dev, setDev] = useState<Devicex | undefined>();
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
