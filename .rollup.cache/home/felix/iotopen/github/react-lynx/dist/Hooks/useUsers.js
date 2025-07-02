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
            setError((err) => err !== undefined ? undefined : err);
            setUsers(users);
        }).catch((e) => {
            setError(e);
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