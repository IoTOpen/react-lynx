import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { LynxClient } from '@iotopen/node-lynx';


interface lynxClientContext {
    lynxClient: LynxClient;
    newLynxClient: (url: string, apiKey?: string, bearer?: boolean) => void;
}

const defaultLynxClientContext = {
    lynxClient: new LynxClient(''),
    newLynxClient: (_url?: string, _apiKey?: string, _bearer?: boolean) => {
        // intentionally unused, see interface for signature
    }
};

const LynxClientContext = createContext(defaultLynxClientContext as lynxClientContext);

interface LynxClientProviderProps {
    children?: ReactNode;
    url?: string | undefined;
    apiKey?: string | undefined;
    bearer?: boolean | undefined;
}

export const LynxClientProvider = ({ children, url, apiKey, bearer }: LynxClientProviderProps) => {
    const [client, setClient] = useState(new LynxClient(url, apiKey, bearer));
    const newClient = useCallback((newUrl: string, newApiKey?: string, newBearer?: boolean) => {
        setClient(new LynxClient(newUrl, newApiKey, newBearer));
    }, [setClient]);
    const contextValue = useMemo(() => ({ lynxClient: client, newLynxClient: newClient }), [client, newClient]);
    return (
        <LynxClientContext.Provider value={contextValue}>
            {children}
        </LynxClientContext.Provider>
    );
};

export const useGlobalLynxClient = () => {
    return useContext(LynxClientContext);
};
