import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useNewFunction = (installationId, template) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [newFunction, setNewFunction] = useState({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: id
    });
    const setType = useCallback((t) => {
        setNewFunction({ ...newFunction, type: t });
    }, [newFunction, setNewFunction]);
    const create = useCallback(() => {
        return lynxClient.createFunction(newFunction);
    }, [lynxClient, newFunction]);
    return {
        newFunction: newFunction,
        setNewFunction: setNewFunction,
        create: create,
        setType: setType,
    };
};
//# sourceMappingURL=useNewFunction.js.map