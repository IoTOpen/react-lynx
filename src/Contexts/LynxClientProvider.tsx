import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { LynxClient } from '@iotopen/node-lynx';
import type { ReactNode} from 'react';


interface lynxClientContext {
    lynxClient: LynxClient;
    /**
     * Re-initializes the LynxClient instance with new connection parameters.
     * @param url The base URL for the Lynx API endpoint. Should be the root endpoint for your Lynx backend service.
     * @param apiKey API key for authenticating requests to the Lynx API. If omitted, the client may use other auth methods.
     * @param bearer If true, use Bearer token authentication instead of API key. Required for OAuth2 flows or external identity providers.
     */
    newLynxClient: (url: string, apiKey?: string, bearer?: boolean) => void;
}

const defaultLynxClientContext = {
    lynxClient: new LynxClient(''),
    newLynxClient: () => {
        // No-op: default context does not re-initialize client.
        // This avoids unused parameter warnings in strict mode.
    }
};

const LynxClientContext = createContext(defaultLynxClientContext as lynxClientContext);

interface LynxClientProviderProps {
    /**
     * Child React nodes to be rendered within the provider.
     */
    children?: ReactNode;
    /**
     * The base URL for the Lynx API endpoint. Used to initialize the LynxClient instance.
     * This should be the root endpoint for your Lynx backend service.
     */
    url?: string;
    /**
     * API key for authenticating requests to the Lynx API. If omitted, the client may use other auth methods.
     * Never hardcode secrets; prefer environment variables or secure config.
     */
    apiKey?: string;
    /**
     * If true, use Bearer token authentication instead of API key. This is required for OAuth2 flows or when integrating with external identity providers.
     * Defaults to false if not specified.
     */
    bearer?: boolean;
}

export const LynxClientProvider = ({ children, url, apiKey, bearer }: LynxClientProviderProps) => {
    const [client, setClient] = useState(new LynxClient(url, apiKey, bearer));
    const newClient = useCallback((url: string, apiKey?: string, bearer?: boolean) => { setClient(new LynxClient(url, apiKey, bearer)); }, [setClient]);
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
