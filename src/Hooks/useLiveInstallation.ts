import {SimpleMQTT} from './useSimpleMQTT';
import {useInstallation} from './useInstallation';
import {useFunctions} from './useFunctions';
import {useDevices} from './useDevices';
import {useEffect} from 'react';
import {Devicex, Functionx, Installation} from '@iotopen/node-lynx';
import {useMQTT} from './useMQTT';

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

    useEffect(() => {
        mqtt.setSubs([`${installation.client_id}/#`]);
        mqtt.bind(/^[0-9]+\/evt\/functionx\/updated$/, fnRefresh);
        mqtt.bind(/^[0-9]+\/evt\/devicex\/updated$/, devRefresh);
        return () => {
            mqtt.unbind(fnRefresh);
            mqtt.unbind(devRefresh);
        };
    }, [devRefresh, fnRefresh, installation, mqtt]);

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

    useEffect(() => {
        mqtt.setSubs([`${installation.client_id}/#`]);
        mqtt.bind(/^[0-9]+\/evt\/functionx\/updated$/, fnRefresh);
        mqtt.bind(/^[0-9]+\/evt\/devicex\/updated$/, devRefresh);
        return () => {
            mqtt.unbind(fnRefresh);
            mqtt.unbind(devRefresh);
        };
    }, [devRefresh, fnRefresh, installation, mqtt]);

    return {
        installation,
        functions,
        devices,
        mqtt
    } as LiveInstallation;
};
