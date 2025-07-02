import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
const zeroEmptyOrganization = {
    address: {
        address: '',
        city: '',
        country: '',
        zip: '',
    },
    children: [],
    email: '',
    force_sms_login: false,
    meta: {},
    name: '',
    notes: '',
    parent: 0,
    password_valid_days: 0,
    phone: '',
    protected_meta: {},
};
export const useNewOrganization = (parentId, template) => {
    const pid = typeof parentId === 'string' ? Number.parseInt(parentId) : parentId;
    if (isNaN(pid)) {
        throw new Error('invalid parentId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [newOrganization, setNewOrganization] = useState({
        ...zeroEmptyOrganization,
        ...template, parent: pid
    });
    const create = useCallback(() => {
        return lynxClient.createOrganization(newOrganization);
    }, [lynxClient, newOrganization]);
    return {
        newOrganization,
        setNewOrganization,
        create,
    };
};
//# sourceMappingURL=useNewOrganization.js.map