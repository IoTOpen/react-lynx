import { useCallback, useEffect, useState } from 'react';

import type { Metadata, User } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';


// TODO: implement organization filter
export const useUsers = (filter?: Metadata) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const { lynxClient } = useGlobalLynxClient();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getUsers(filter).then((fetchedUsers) => {
            setError((err) => err !== undefined ? undefined : err);
            setUsers(fetchedUsers);
        }).catch((e) => {
            setError(e as Error);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);

    useEffect(() => {
        queueMicrotask(refresh);
    }, [refresh]);

    return {
        users,
        setUsers,
        refresh,
        loading,
        error
    };
};
