import { useEffect } from 'react';

import type { Devicex, Functionx, Installation } from '@iotopen/node-lynx';

import { useDevices } from './useDevices';
import { useFunctions } from './useFunctions';
import { useInstallation } from './useInstallation';
import { useMQTT } from './useMQTT';
import type { SimpleMQTT } from './useSimpleMQTT';

export interface LiveInstallation {
    installation: Installation;
    functions: Functionx[];
    devices: Devicex[];
    mqtt: SimpleMQTT;
}

export const useLiveInstallation = (installation: Installation): LiveInstallation => {
    const mqtt = useMQTT();
    const { functions, refresh: fnRefresh } = useFunctions(installation.id);
    const { devices, refresh: devRefresh } = useDevices(installation.id);
    const { unbind, bind, setSubs } = mqtt;

    useEffect(() => {
        setSubs([`${installation.client_id}/#`]);
        bind(/[0-9]+\/evt\/functionx\/updated/, fnRefresh);
        bind(/[0-9]+\/evt\/devicex\/updated/, devRefresh);
        return () => {
            unbind(fnRefresh);
            unbind(devRefresh);
        };
    }, [bind, devRefresh, fnRefresh, installation, setSubs, unbind]);

    return {
        installation,
        functions,
        devices,
        mqtt,
    };
};

export const useLiveInstallationId = (installationId: number | string): LiveInstallation => {
    const mqtt = useMQTT();
    const { installation } = useInstallation(installationId);
    const { functions, refresh: fnRefresh } = useFunctions(installationId);
    const { devices, refresh: devRefresh } = useDevices(installationId);
    const { unbind, bind, setSubs } = mqtt;
    useEffect(() => {
        setSubs([`${installation.client_id}/#`]);
        bind(/[0-9]+\/evt\/functionx\/updated/, fnRefresh);
        bind(/[0-9]+\/evt\/devicex\/updated/, devRefresh);
        return () => {
            unbind(fnRefresh);
            unbind(devRefresh);
        };
    }, [bind, devRefresh, fnRefresh, installation, setSubs, unbind]);

    return {
        installation,
        functions,
        devices,
        mqtt,
    };
};
