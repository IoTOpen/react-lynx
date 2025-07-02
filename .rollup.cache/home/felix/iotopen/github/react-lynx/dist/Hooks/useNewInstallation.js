import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useNewInstallation = (organizationId, template) => {
    const oid = typeof organizationId === 'string' ? Number.parseInt(organizationId) : organizationId;
    if (isNaN(oid)) {
        throw new Error('invalid organizationId');
    }
    const [newInstallation, setNewInstallation] = useState({
        name: '', notes: '', users: [],
        meta: {},
        protected_meta: {},
        ...template, organization_id: oid
    });
    const { lynxClient } = useGlobalLynxClient();
    const create = useCallback(() => {
        return lynxClient.createInstallation(newInstallation);
    }, [lynxClient, newInstallation]);
    return {
        newInstallation: newInstallation,
        setNewInstallation: setNewInstallation,
        create: create,
    };
};
//# sourceMappingURL=useNewInstallation.js.map