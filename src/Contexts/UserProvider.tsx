import {createContext, useContext, useLayoutEffect, useMemo, useState} from 'react';

import type {ErrorResponse, User} from '@iotopen/node-lynx';
import type { ReactNode} from 'react';

import {useGlobalLynxClient} from './LynxClientProvider';

interface userContext {
    user: User | null;
    permissions: Record<string, boolean> | null;
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

// Type guard for ErrorResponse to ensure type safety in catch blocks.
const isErrorResponse = (e: unknown): e is ErrorResponse => (
    typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        'status' in e
);

export const UserProvider = ({children}: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const {lynxClient} = useGlobalLynxClient();
    useLayoutEffect(() => {
        const me = lynxClient.getMe();
        const perms = lynxClient.getPermissions();
        setLoading(true);
        Promise.all([me, perms]).then(([u, p]) => {
            setError((err) => err !== undefined ? undefined : err);
            setUser(u);
            setPermissions(p);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
            setUser(null);
            setPermissions(null);
        }).finally(() => {
            setLoading(false);
        });
         
    }, [lynxClient]);
    const contextValue = useMemo(() => ({user, permissions, loading, error}), [user, permissions, loading, error]);
    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};


export const useGlobalUser = () => useContext(UserContext);

export const useGlobalPermissions = () => {
    const {permissions} = useGlobalUser();
    return permissions;
};
