import {ErrorResponse, MinimalOrg, Organization} from '@iotopen/node-lynx';
import {useCallback, useEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';

export const useOrganizations = <T extends boolean = false>(minimal?: T) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [organizations, setOrganizations] = useState<MinimalOrg<T>[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOrganizations(minimal === true).then(orgs => {
            setError((err) => err !== undefined ? undefined : err);
            setOrganizations(<MinimalOrg<T>[]>orgs);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, minimal]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const create = useCallback((org: Organization) => {
        return lynxClient.createOrganization(org);
    }, [lynxClient]);

    const remove = useCallback((org: Organization) => {
        return lynxClient.deleteOrganization(org);
    }, [lynxClient]);

    return {
        loading,
        organizations,
        setOrganizations,
        error,
        create,
        remove,
    };
};