import {Devicex, Functionx, Installation} from '@iotopen/node-lynx';
import {useEffect} from 'react';

import {useDevices} from './useDevices';
import {useFunctions} from './useFunctions';
import {useInstallation} from './useInstallation';
import {useMQTT} from './useMQTT';
import {SimpleMQTT} from './useSimpleMQTT';

export interface LiveInstallation {
    installation: Installation;
    functions: Functionx[];
    devices: Devicex[];
    mqtt: SimpleMQTT;
}

export const useLiveInstallation = (installation: Installation) => {
    const mqtt = useMQTT();
    const {functions, refresh: fnRefresh} = useFunctions(installation.id);
    const {devices, refresh: devRefresh} = useDevices(installation.id);
    const {unbind, bind, setSubs} = mqtt;

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
    } as LiveInstallation;
};

export const useLiveInstallationId = (installationId: number | string) => {
    const mqtt = useMQTT();
    const {installation} = useInstallation(installationId);
    const {functions, refresh: fnRefresh} = useFunctions(installationId);
    const {devices, refresh: devRefresh} = useDevices(installationId);
    const {unbind, bind, setSubs} = mqtt;
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
        mqtt
    } as LiveInstallation;
};
