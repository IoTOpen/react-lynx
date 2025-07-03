import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useNewDevice = (installationId, template) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [newDevice, setNewDevice] = useState({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: id
    });
    const setType = useCallback((t) => {
        setNewDevice({ ...newDevice, type: t });
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
//# sourceMappingURL=useNewDevice.js.map