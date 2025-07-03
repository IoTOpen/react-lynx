import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
// TODO: implement organization filter
export const useUsers = (filter) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const { lynxClient } = useGlobalLynxClient();
    new URLSearchParams();
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getUsers(filter).then((users) => {
            setError(undefined);
            setUsers(users);
        }).catch((e) => {
            // Defensive: Ensure only Error is set
            if (e instanceof Error) {
                setError(e);
            }
            else {
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
//# sourceMappingURL=useUsers.js.map