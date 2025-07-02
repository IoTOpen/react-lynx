import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { useGlobalLynxClient } from './LynxClientProvider';
const defaultUserContext = {
    user: null,
    permissions: null,
};
const UserContext = createContext(defaultUserContext);
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const { lynxClient } = useGlobalLynxClient();
    useLayoutEffect(() => {
        const me = lynxClient.getMe();
        const perms = lynxClient.getPermissions();
        setLoading(true);
        Promise.all([me, perms]).then(([u, p]) => {
            setError((err) => err !== undefined ? undefined : err);
            setUser(u);
            setPermissions(p);
        }).catch(e => {
            setError(e);
            setUser(null);
            setPermissions(null);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);
    const contextValue = useMemo(() => ({ user, permissions, loading, error }), [user, permissions, loading, error]);
    return (_jsx(UserContext.Provider, { value: contextValue, children: children }));
};
export const useGlobalUser = () => {
    return useContext(UserContext);
};
export const useGlobalPermissions = () => {
    const { permissions } = useGlobalUser();
    return permissions;
};
//# sourceMappingURL=UserProvider.js.map