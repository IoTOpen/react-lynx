import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErrorResponse, MinimalOrg, Organization } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

export const useOrganizations = <T extends boolean = false>(minimal?: T) => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [organizations, setOrganizations] = useState<MinimalOrg<T>[]>([]);
    const latestRequest = useRef(0);

    const refreshCall = useCallback((resetData = false) => {
        const request = ++latestRequest.current;

        void Promise.resolve().then(() => {
            if (request !== latestRequest.current) {return;}

            setLoading(true);
            setError(undefined);
            if (resetData) {
                setOrganizations([]);
            }

            void lynxClient.getOrganizations(minimal === true).then(orgs => {
                if (request === latestRequest.current) {
                    setOrganizations(<MinimalOrg<T>[]>orgs);
                }
            }).catch((e: unknown) => {
                if (request === latestRequest.current) {
                    setError(e as ErrorResponse);
                }
            }).finally(() => {
                if (request === latestRequest.current) {
                    setLoading(false);
                }
            });
        });

        return () => {latestRequest.current += 1;};
    }, [lynxClient, minimal]);

    useEffect(() => {
        return refreshCall(true);
    }, [refreshCall]);

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
