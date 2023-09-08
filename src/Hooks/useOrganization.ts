import {Organization} from '@iotopen/node-lynx';
import {useCallback, useEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';

export const useOrganization = (organizationId: number | string) => {
    const oid = typeof organizationId === 'string' ? Number.parseInt(organizationId) : organizationId;
    if (isNaN(oid)) {
        throw new Error('invalid organizationId');
    }

    const [organization, setOrganization] = useState<Organization>({
        id: 0,
        address: {
            address: '',
            city: '',
            country: '',
            zip: '',
        },
        children: [],
        email: '',
        force_sms_login: false,
        parent: 0,
        phone: '',
        name: '',
        notes: '',
        meta: {},
        password_valid_days: 0,
        protected_meta: {},
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>();
    const {lynxClient} = useGlobalLynxClient();

    const refresh = useCallback( () => {
        setLoading(true);
        lynxClient.getOrganization(oid).then(org => {
            if (error !== undefined) setError(undefined);
            setOrganization(org);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [error, lynxClient, oid]);

    useEffect(() => {
        refresh();
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
    };
};