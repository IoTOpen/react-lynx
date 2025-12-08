import type { ReactNode } from 'react';

import { LynxClientProvider } from './LynxClientProvider';
import { UserProvider } from './UserProvider';

interface LynxProviderProps {
    apiURL?: string;
    apiKey?: string;
    bearer?: boolean;
    children?: ReactNode;
}

export const LynxProvider = ({ children, apiURL, apiKey, bearer }: LynxProviderProps) => {
    return (
        <LynxClientProvider url={apiURL} apiKey={apiKey} bearer={bearer}>
            <UserProvider>
                {children}
            </UserProvider>
        </LynxClientProvider>
    );
};
