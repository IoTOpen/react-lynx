import {Metadata, User} from '@iotopen/node-lynx';
import {useCallback, useMemo, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';


// TODO: implement organization filter
export const useUsers = (filter?: Metadata) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const {lynxClient} = useGlobalLynxClient();

    new URLSearchParams();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getUsers(filter).then((users) => {
            if (error !== undefined) setError(undefined);
            setUsers(users);
        }).catch((e) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter, error]);

    return {
        users,
        setUsers,
        refresh,
        loading,
        error
    };
};