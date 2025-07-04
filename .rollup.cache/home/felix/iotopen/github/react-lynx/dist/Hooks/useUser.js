import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
const zeroUser = {
    id: 0,
    address: {
        address: '',
        zip: '',
        city: '',
        country: ''
    },
    assigned_installations: [],
    email: '',
    expire_at: 0,
    first_name: '',
    last_name: '',
    mobile: '',
    note: '',
    organisations: [],
    password: '',
    role: 0,
    sms_login: false,
    protected_meta: {},
    meta: {},
};
export const useUser = (userId) => {
    const id = typeof userId === 'string' ? Number.parseInt(userId) : userId;
    if (isNaN(id)) {
        throw new Error('invalid userId');
    }
    const [user, setUser] = useState({ ...zeroUser });
    const [loading, setLoading] = useState(true);
    const { lynxClient } = useGlobalLynxClient();
    const [error, setError] = useState();
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getUser(id).then((user) => {
            setError((err) => err !== undefined ? undefined : err);
            setUser(user);
        }).catch((e) => {
            // Only set Error objects; fallback to a generic error if needed
            if (e instanceof Error) {
                setError(e);
            }
            else {
                setError(new Error('Unknown error occurred while fetching user.'));
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id]);
    const update = useCallback(() => {
        return lynxClient.updateUser(user);
    }, [lynxClient, user]);
    const remove = useCallback(() => {
        return lynxClient.deleteUser(user);
    }, [lynxClient, user]);
    return {
        loading,
        error,
        user,
        setUser,
        update,
        refresh,
        remove,
    };
};
//# sourceMappingURL=useUser.js.map