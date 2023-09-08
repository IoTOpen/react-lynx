import {EmptyDevicex, Metadata} from '@iotopen/node-lynx';
import {useCallback, useLayoutEffect, useState} from 'react';
import {useMeta} from './useMeta';
import {useGlobalLynxClient} from '../Contexts';

export type DeviceTemplate = {
    type?: string
    meta?: Metadata
    protected_meta?: Metadata
};

export const useNewDevice = (installationId: number | string, template?: DeviceTemplate) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [newDevice, setNewDevice] = useState<EmptyDevicex>({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: id
    });

    const setType = useCallback((t: string) => {
        setNewDevice({...newDevice, type: t});
    }, [newDevice, setNewDevice]);

    const create = useCallback(() => {
        return lynxClient.createDevice(newDevice);
    }, [lynxClient, newDevice]);

    return {
        newDevice: newDevice,
        setNewDevice: setNewDevice,
        create: create,
        setType: setType,
    };
};
