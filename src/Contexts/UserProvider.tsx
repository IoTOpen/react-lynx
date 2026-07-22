import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import type { ErrorResponse, LynxClient, User } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from './LynxClientProvider';

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

interface UserState {
    client: LynxClient;
    user: User | null;
    permissions: { [key: string]: boolean } | null;
    error: ErrorResponse | undefined;
    loading: boolean;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const { lynxClient } = useGlobalLynxClient();
    const [state, setState] = useState<UserState>(() => ({
        client: lynxClient,
        user: null,
        permissions: null,
        error: undefined,
        loading: Boolean(lynxClient.apiKey),
    }));
    useEffect(() => {
        let active = true;

        if (!lynxClient.apiKey) {
            return () => { active = false; };
        }

        void Promise.all([lynxClient.getMe(), lynxClient.getPermissions()]).then(([u, p]) => {
            if (!active) { return; }
            setState({ client: lynxClient, user: u, permissions: p, error: undefined, loading: false });
        }).catch((e: unknown) => {
            if (!active) { return; }
            setState({ client: lynxClient, user: null, permissions: null, error: e as ErrorResponse, loading: false });
        });

        return () => { active = false; };
    }, [lynxClient]);
    const contextValue = useMemo(() => {
        if (state.client === lynxClient) {
            return state;
        }

        return { user: null, permissions: null, error: undefined, loading: Boolean(lynxClient.apiKey) };
    }, [state, lynxClient]);
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
    const { permissions } = useGlobalUser();
    return permissions;
};
