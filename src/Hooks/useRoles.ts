import {useCallback, useEffect, useState} from 'react';

import type {Role} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';

export const useRoles = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [roles, setRoles] = useState<Role[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getRoles().then((fetchedRoles) => {
            setError((err) => err !== undefined ? undefined : err);
            setRoles(fetchedRoles);
        }).catch((e: unknown) => {
            // Only set Error objects; fallback to a generic error if needed
            if (e instanceof Error) {
                setError(e);
            } else {
                setError(new Error('Unknown error occurred while fetching roles.'));
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    useEffect(() => {
        refresh();
        /* eslint-disable react-hooks/exhaustive-deps */
    }, []);

    return {
        loading,
        error,
        roles,
        refresh
    };
};
