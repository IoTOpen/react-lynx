import {EmptyDevicex, Metadata} from '@iotopen/node-lynx';
import {useCallback, useLayoutEffect, useState} from 'react';
import {useMeta} from './useMeta';
import {useGlobalLynxClient} from '../Contexts';

export type DeviceTemplate = {
    type?: string
    meta?: Metadata
    protected_meta?: Metadata
};

export const useNewDevice = (installationId: number, template?: DeviceTemplate) => {
    const {lynxClient} = useGlobalLynxClient();
    const [newDevice, setNewDevice] = useState<EmptyDevicex>({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: installationId
    });
    const {setMeta, removeMeta, compile, metaList, addMeta, setMetaKey, setMetaValue, setMetaProtected} = useMeta(newDevice, []);

    useLayoutEffect(() => {
        setNewDevice({...newDevice, ...compile()});
    }, [compile, metaList, setNewDevice]);

    const setType = useCallback((t: string) => {
        setNewDevice({...newDevice, type: t});
    }, [newDevice, setNewDevice]);

    const create = useCallback(() => {
        return lynxClient.createDevice(newDevice);
    }, [lynxClient, newDevice]);

    return {
        newDevice: newDevice,
        create: create,
        setType: setType,
        removeMeta: removeMeta,
        addMeta: addMeta,
        updateMeta: setMeta,
        metaList: metaList,
        setMetaKey: setMetaKey,
        setMetaValue: setMetaValue,
        setMetaProtected: setMetaProtected,
    };
};
