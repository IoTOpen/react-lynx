import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { useMQTT } from './useMQTT';
export const useMultiLiveInstallation = (installations) => {
    const { lynxClient } = useGlobalLynxClient();
    const mqtt = useMQTT();
    const { bind, unbind, setSubs } = mqtt;
    // To keep track of client id => installation
    const [clientIdMap, setClientIdMap] = useState(new Map());
    const [installationMap, setInstallationMap] = useState(new Map());
    const [functionMap, setFunctionMap] = useState(new Map());
    const [deviceMap, setDeviceMap] = useState(new Map());
    const toClientId = useCallback((installationId) => {
        const i = installationMap.get(installationId);
        if (i !== undefined) {
            return i.client_id;
        }
        return 0;
    }, [installationMap]);
    const toInstallationId = useCallback((clientId) => {
        const i = clientIdMap.get(clientId);
        if (i !== undefined) {
            return i.id;
        }
        return 0;
    }, [clientIdMap]);
    useEffect(() => {
        if (installations.length === 0) {
            return;
        }
        const newInstallationMap = new Map();
        const newClientIdMap = new Map();
        const newTopics = new Array();
        installations.forEach((inst) => {
            newInstallationMap.set(inst.id, inst);
            newClientIdMap.set(inst.client_id, inst);
            newTopics.push(`${inst.client_id}/#`);
        });
        // This is a flag to prevent new fetches during the initial fetch
        let done = false;
        const fnFetchers = installations.map(async (i) => {
            const fns = await lynxClient.getFunctions(i.id);
            return { functions: fns, installationId: i.id };
        });
        const devFetchers = installations.map(async (i) => {
            const devs = await lynxClient.getDevices(i.id);
            return { devices: devs, installationId: i.id };
        });
        const newDeviceMap = new Map();
        const newFunctionMap = new Map();
        const work = new Promise((resolve, reject) => {
            let fnDone = false;
            let devDone = false;
            Promise.allSettled(fnFetchers).then((fnsResult) => {
                fnsResult.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        newFunctionMap.set(result.value.installationId, result.value.functions);
                    }
                });
                fnDone = true;
                if (fnDone && devDone)
                    resolve();
            }).catch(reject);
            Promise.allSettled(devFetchers).then((devsResult) => {
                devsResult.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        newDeviceMap.set(result.value.installationId, result.value.devices);
                    }
                });
                devDone = true;
                if (fnDone && devDone)
                    resolve();
            }).catch(reject);
        });
        work.finally(() => {
            setClientIdMap(() => newClientIdMap);
            setInstallationMap(() => newInstallationMap);
            setFunctionMap(() => newFunctionMap);
            setDeviceMap(() => newDeviceMap);
            // Now we can accept updates from mqtt
            done = true;
        });
        const fnRefresh = (topic) => {
            if (!done)
                return;
            const cid = Number(topic.split('/')[0]);
            const inst = newClientIdMap.get(cid);
            if (inst === undefined)
                return;
            lynxClient.getFunctions(inst.id).then((fns) => {
                setFunctionMap((p) => new Map([...p, [inst.id, fns]]));
            });
        };
        const devRefresh = (topic) => {
            if (!done)
                return;
            const cid = Number(topic.split('/')[0]);
            const inst = newClientIdMap.get(cid);
            if (inst === undefined)
                return;
            lynxClient.getDevices(inst.id).then((devs) => {
                setDeviceMap((p) => new Map([...p, [inst.id, devs]]));
            });
        };
        setSubs(newTopics);
        bind(/[0-9]+\/evt\/functionx\/updated/, fnRefresh);
        bind(/[0-9]+\/evt\/devicex\/updated/, devRefresh);
        return () => {
            unbind(fnRefresh);
            unbind(devRefresh);
        };
    }, [installations, lynxClient, bind, unbind, setSubs]);
    return {
        installationMap,
        functionMap,
        deviceMap,
        mqtt,
        toClientId,
        toInstallationId
    };
};
//# sourceMappingURL=useMultiLiveInstallation.js.map