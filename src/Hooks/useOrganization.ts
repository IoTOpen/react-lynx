import {useCallback, useEffect, useState} from 'react';

import type {Organization} from '@iotopen/node-lynx';

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

    // Type guard for Error to ensure type safety in catch blocks.
    const isError = (e: unknown): e is Error => (
        typeof e === 'object' &&
            e !== null &&
            'message' in e
    );

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOrganization(oid).then(org => {
            setError((err) => err !== undefined ? undefined : err);
            setOrganization(org);
        }).catch((e: unknown) => {
            if (isError(e)) {
                setError(e);
            } else {
                setError(new Error('Unknown error'));
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, oid]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const update = useCallback(() => lynxClient.updateOrganization(organization), [lynxClient, organization]);

    const remove = useCallback(() => lynxClient.deleteOrganization(organization), [lynxClient, organization]);

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