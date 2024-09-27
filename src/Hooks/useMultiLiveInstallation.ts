import {Devicex, Functionx, Installation} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {useMQTT} from './useMQTT';
import {SimpleMQTT} from './useSimpleMQTT';

export interface MultiLiveInstallation {
    installationMap: Map<number, Installation>;
    functionMap: Map<number, Functionx[]>;
    deviceMap: Map<number, Devicex[]>;
    mqtt: SimpleMQTT;
    toClientId: (iid: number) => number;
    toInstallationId: (cid: number) => number;
}

export const useMultiLiveInstallation = (installations: Installation[]) => {
    const {lynxClient} = useGlobalLynxClient();
    const mqtt = useMQTT();

    // To keep track of client id => installation
    const [clientIdMap, setClientIdMap] = useState<Map<number, Installation>>(new Map());

    const [installationMap, setInstallationMap] = useState<Map<number, Installation>>(new Map());
    const [functionMap, setFunctionMap] = useState<Map<number, Functionx[]>>(new Map());
    const [deviceMap, setDeviceMap] = useState<Map<number, Devicex[]>>(new Map());

    const toClientId = useCallback((installationId: number) => {
        const i = installationMap.get(installationId);
        if (i !== undefined) {
            return i.client_id;
        }
        return 0;
    }, [installationMap]);

    const toInstallationId = useCallback((clientId: number) => {
        const i = clientIdMap.get(clientId);
        if (i !== undefined) {
            return i.id;
        }
        return 0;
    }, [clientIdMap]);

    useEffect(() => {
        const newInstallationMap = new Map<number, Installation>();
        const newClientIdMap = new Map<number, Installation>();
        const newTopics = new Array<string>();

        installations.forEach((inst) => {
            newInstallationMap.set(inst.id, inst);
            newClientIdMap.set(inst.client_id, inst);
            newTopics.push(`${inst.client_id}/#`);
        });
        setClientIdMap(() => newClientIdMap);
        setInstallationMap(() => newInstallationMap);

        // This is a flag to prevent new fetches during the initial fetch
        let done = false;
        const fnFetchers = installations.map(async (i) => {
            const fns = await lynxClient.getFunctions(i.id);
            return {functions: fns, installationId: i.id};
        });
        const devFetchers = installations.map(async (i) => {
            const devs = await lynxClient.getDevices(i.id);
            return {devices: devs, installationId: i.id};
        });

        const newDeviceMap = new Map<number, Devicex[]>();
        const newFunctionMap = new Map<number, Functionx[]>();
        const work = new Promise<void>((resolve, reject) => {
            let fnDone = false;
            let devDone = false;
            Promise.allSettled(fnFetchers).then((fnsResult) => {
                fnsResult.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        newFunctionMap.set(result.value.installationId, result.value.functions);
                    }
                });
                fnDone = true;
                if (fnDone && devDone) resolve();
            }).catch(reject);

            Promise.allSettled(devFetchers).then((devsResult) => {
                devsResult.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        newDeviceMap.set(result.value.installationId, result.value.devices);
                    }
                });
                devDone = true;
                if (fnDone && devDone) resolve();
            }).catch(reject);
        });
        work.finally(() => {
            setFunctionMap(() => newFunctionMap);
            setDeviceMap(() => newDeviceMap);
            // Now we can accept updates from mqtt
            done = true;
        });

        const fnRefresh = (topic: string) => {
            if (!done) return;
            const cid = Number(topic.split('/')[0]);
            const inst = newClientIdMap.get(cid);
            if (inst === undefined) return;
            lynxClient.getFunctions(inst.id).then((fns) => {
                setFunctionMap((p) => new Map([...p, [inst.id, fns]]));
            });
        };
        const devRefresh = (topic: string) => {
            if (!done) return;
            const cid = Number(topic.split('/')[0]);
            const inst = newClientIdMap.get(cid);
            if (inst === undefined) return;
            lynxClient.getDevices(inst.id).then((devs) => {
                setDeviceMap((p) => new Map([...p, [inst.id, devs]]));
            });
        };
        mqtt.setSubs(newTopics);
        mqtt.bind(/^[0-9]+\/evt\/functionx\/updated$/, fnRefresh);
        mqtt.bind(/^[0-9]+\/evt\/devicex\/updated$/, devRefresh);
        return () => {
            mqtt.unbind(fnRefresh);
            mqtt.unbind(devRefresh);
        };
    }, [installations, lynxClient, mqtt]);

    return {
        installationMap,
        functionMap,
        deviceMap,
        mqtt,
        toClientId,
        toInstallationId
    } as MultiLiveInstallation;
};
