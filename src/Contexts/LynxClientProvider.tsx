import {createContext, ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {LynxClient} from '@iotopen/node-lynx';


interface lynxClientContext {
    lynxClient: LynxClient;
    newLynxClient: (url: string, apiKey?: string) => void;
}

const defaultLynxClientContext = {
    lynxClient: new LynxClient(''),
    newLynxClient: (url?: string, apiKey?: string, bearer?: boolean) => {
    }
};

const LynxClientContext = createContext(defaultLynxClientContext as lynxClientContext);

interface LynxClientProviderProps {
    children?: ReactNode;
    url?: string;
    apiKey?: string;
    bearer?: boolean;
}

export const LynxClientProvider = ({children, url, apiKey, bearer}: LynxClientProviderProps) => {
    const [client, setClient] = useState(new LynxClient(url, apiKey, bearer));
    const newClient = useCallback((url: string, apiKey?: string, bearer?: boolean) => setClient(new LynxClient(url, apiKey, bearer)), [setClient]);
    const contextValue = useMemo(() => ({lynxClient: client, newLynxClient: newClient}), [client, newClient]);
    return (
        <LynxClientContext.Provider value={contextValue}>
            {children}
        </LynxClientContext.Provider>
    );
};

export const useGlobalLynxClient = () => {
    return useContext(LynxClientContext);
};
