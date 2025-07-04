import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
const zeroDevice = {
    updated: 0,
    created: 0,
    id: 0,
    installation_id: 0,
    type: '',
    meta: {},
    protected_meta: {}
};
export const useDevice = (installationId, deviceId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof deviceId === 'string' ? Number.parseInt(deviceId) : deviceId;
    if (isNaN(iid) || isNaN(id)) {
        throw new Error('invalid installationId or deviceId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [dev, setDev] = useState({ ...zeroDevice });
    const [error, setError] = useState();
    useLayoutEffect(() => {
        lynxClient.getDevice(iid, id).then(fn => {
            setError((err) => err !== undefined ? undefined : err);
            setDev(fn);
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
    }, [lynxClient, iid, id]);
    const update = useCallback(async () => {
        if (!dev) {
            throw new Error('update on undefined function');
        }
        return lynxClient.updateDevice(dev);
    }, [lynxClient, dev]);
    const setType = useCallback((t) => {
        if (dev)
            setDev({ ...dev, type: t });
    }, [dev, setDev]);
    const remove = useCallback(async () => {
        if (!dev) {
            throw new Error('delete on undefined function');
        }
        return lynxClient.deleteDevice(dev);
    }, [dev, lynxClient]);
    return {
        loading: loading,
        error: error,
        Device: dev,
        setDevice: setDev,
        update: update,
        remove: remove,
        setType: setType,
    };
};
export const useDeviceMeta = (installationId, deviceId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const defaultDevId = typeof deviceId === 'string' ? Number.parseInt(deviceId) : deviceId;
    const { lynxClient } = useGlobalLynxClient();
    /**
     * Use the provided devId if present, otherwise fall back to the defaultDevId from the hook's arguments.
     * This ensures correct device targeting and avoids shadowing issues.
     */
    const create = useCallback((key, meta, devId, silent) => {
        const id = devId ?? defaultDevId ?? 0;
        return lynxClient.createDeviceMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, defaultDevId]);
    const update = useCallback((key, meta, createMissing, devId, silent) => {
        const id = devId ?? defaultDevId ?? 0;
        return lynxClient.updateDeviceMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, defaultDevId]);
    const remove = useCallback((key, devId, silent) => {
        const id = devId ?? defaultDevId ?? 0;
        return lynxClient.deleteDeviceMeta(iid, id, key, silent);
    }, [lynxClient, iid, defaultDevId]);
    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
//# sourceMappingURL=useDevice.js.map