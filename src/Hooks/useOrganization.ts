import {Organization} from '@iotopen/node-lynx';
import {useCallback, useEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';

const zeroOrganization = {
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
    id: 0
};
export const useOrganization = (organizationId: number | string) => {
    const oid = typeof organizationId === 'string' ? Number.parseInt(organizationId) : organizationId;
    if (isNaN(oid)) {
        throw new Error('invalid organizationId');
    }
    const [organization, setOrganization] = useState<Organization>({...zeroOrganization});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>();
    const {lynxClient} = useGlobalLynxClient();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOrganization(oid).then(org => {
            setError((err) => err !== undefined ? undefined : err);
            setOrganization(org);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, oid]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const update = useCallback(() => {
        return lynxClient.updateOrganization(organization);
    }, [lynxClient, organization]);

    const remove = useCallback(() => {
        return lynxClient.deleteOrganization(organization);
    }, [lynxClient, organization]);

    return {
        loading,
        organization,
        setOrganization,
        error,
        update,
        remove,
        refresh
    };
};