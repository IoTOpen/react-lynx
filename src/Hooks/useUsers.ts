import { useCallback, useState } from 'react';

import type { Metadata, User } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';


// TODO: implement organization filter
export const useUsers = (filter?: Metadata) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const { lynxClient } = useGlobalLynxClient();

    new URLSearchParams();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getUsers(filter).then((fetchedUsers) => {
            setError(undefined);
            setUsers(fetchedUsers);
        }).catch((e: unknown) => {
            // Defensive: Ensure only Error is set
            if (e instanceof Error) {
                setError(e);
            } else {
                setError(new Error('Unknown error'));
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);

    return {
        users,
        setUsers,
        refresh,
        loading,
        error
    };
};
