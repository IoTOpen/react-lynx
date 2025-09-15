import {useCallback, useEffect, useState} from 'react';

import type {ErrorResponse, MinimalOrg, Organization} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

// Removed local isErrorResponse definition, now using shared utility

export const useOrganizations = <T extends boolean = false>(minimal?: T) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [organizations, setOrganizations] = useState<MinimalOrg<T>[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOrganizations(minimal === true).then(orgs => {
            setError((err) => err !== undefined ? undefined : err);
            setOrganizations((orgs as MinimalOrg<T>[]));
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, minimal]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const create = useCallback((org: Organization) => lynxClient.createOrganization(org), [lynxClient]);

    const remove = useCallback((org: Organization) => lynxClient.deleteOrganization(org), [lynxClient]);

    return {
        loading,
        organizations,
        setOrganizations,
        error,
        create,
        remove,
    };
};