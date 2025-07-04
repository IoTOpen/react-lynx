import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
export const useDevices = (installationId, filter) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid) && iid !== undefined) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState();
    const refreshCall = useCallback(() => {
        if (iid === undefined) {
            setLoading(false);
            setDevices([]);
            return;
        }
        setLoading(true);
        lynxClient.getDevices(iid, filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setDevices(res);
        }).catch((e) => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, filter]);
    function removeFn(devs) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last)
                return Promise.allSettled([]);
            const rest = devs.map((dev => {
                return lynxClient.deleteDevice(dev, true);
            }));
            return Promise.allSettled(rest).then(async (settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.deleteDevice(last) });
                }
                catch (e) {
                    settled.push({ status: 'rejected', reason: e });
                }
                return settled;
            });
        }
        return lynxClient.deleteDevice(devs);
    }
    function createFn(devs) {
        if (Array.isArray(devs)) {
            const last = devs.pop();
            if (!last)
                return Promise.allSettled([]);
            const rest = devs.map(dev => {
                return lynxClient.createDevice(dev, true);
            });
            return Promise.allSettled(rest).then(async (settled) => {
                try {
                    settled.push({ status: 'fulfilled', value: await lynxClient.createDevice(last) });
                }
                catch (e) {
                    settled.push({ status: 'rejected', reason: e });
                }
                return settled;
            });
        }
        return lynxClient.createDevice(devs);
    }
    const create = createFn;
    const remove = removeFn;
    useLayoutEffect(() => {
        refreshCall();
    }, [refreshCall]);
    return {
        loading: loading,
        error: error,
        create: create,
        remove: remove,
        devices: devices,
        refresh: refreshCall,
    };
};
//# sourceMappingURL=useDevices.js.map