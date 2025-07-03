import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useRoles = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getRoles().then((roles) => {
            setError((err) => err !== undefined ? undefined : err);
            setRoles(roles);
        }).catch((e) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);
    useEffect(() => {
        refresh();
    }, []);
    return {
        loading,
        error,
        roles,
        refresh
    };
};
//# sourceMappingURL=useRoles.js.map