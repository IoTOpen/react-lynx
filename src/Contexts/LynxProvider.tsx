import {LynxClientProvider} from './LynxClientProvider';
import {ReactNode} from 'react';
import {UserProvider} from './UserProvider';

type LynxProviderProps = {
    apiURL?: string;
    apiKey?: string;
    children?: ReactNode;
}

export const LynxProvider = ({children, apiURL, apiKey}: LynxProviderProps) => {
    return (
        <LynxClientProvider url={apiURL} apiKey={apiKey}>
            <UserProvider>
                {children}
            </UserProvider>
        </LynxClientProvider>
    );
};
