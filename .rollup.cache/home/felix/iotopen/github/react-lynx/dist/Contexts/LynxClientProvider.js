import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LynxClient } from '@iotopen/node-lynx';
const defaultLynxClientContext = {
    lynxClient: new LynxClient(''),
    newLynxClient: () => {
        // No-op: default context does not re-initialize client.
        // This avoids unused parameter warnings in strict mode.
    }
};
const LynxClientContext = createContext(defaultLynxClientContext);
export const LynxClientProvider = ({ children, url, apiKey, bearer }) => {
    const [client, setClient] = useState(new LynxClient(url, apiKey, bearer));
    const newClient = useCallback((url, apiKey, bearer) => { setClient(new LynxClient(url, apiKey, bearer)); }, [setClient]);
    const contextValue = useMemo(() => ({ lynxClient: client, newLynxClient: newClient }), [client, newClient]);
    return (_jsx(LynxClientContext.Provider, { value: contextValue, children: children }));
};
export const useGlobalLynxClient = () => {
    return useContext(LynxClientContext);
};
//# sourceMappingURL=LynxClientProvider.js.map