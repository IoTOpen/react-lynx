import {createContext, ReactNode, useContext, useLayoutEffect, useMemo, useState} from 'react';
import {ErrorResponse, User} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from './LynxClientProvider';

interface userContext {
    user: User | null;
    permissions: { [key: string]: boolean } | null;
    error: ErrorResponse | undefined;
    loading: boolean;
}

const defaultUserContext = {
    user: null,
    permissions: null,
};
const UserContext = createContext(defaultUserContext as userContext);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({children}: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<{ [key: string]: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const {lynxClient} = useGlobalLynxClient();
    useLayoutEffect(() => {
        const me = lynxClient.getMe();
        const perms = lynxClient.getPermissions();
        setLoading(true);
        Promise.all([me, perms]).then(([u, p]) => {
            setUser(u);
            setPermissions(p);
        }).catch(e => {
            setError(e);
            setUser(null);
            setPermissions(null);
        }).finally(() => {
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient]);
    const contextValue = useMemo(() => ({user, permissions, loading, error}), [user, permissions, loading, error]);
    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};


export const useGlobalUser = () => {
    return useContext(UserContext);
};

export const useGlobalPermissions = () => {
    const {permissions} = useGlobalUser();
    return permissions;
};
