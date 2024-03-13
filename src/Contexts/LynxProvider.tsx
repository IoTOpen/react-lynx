import {LynxClientProvider} from './LynxClientProvider';
import {ReactNode} from 'react';
import {UserProvider} from './UserProvider';

type LynxProviderProps = {
    apiURL?: string;
    apiKey?: string;
    bearer?: boolean;
    children?: ReactNode;
}

export const LynxProvider = ({children, apiURL, apiKey, bearer}: LynxProviderProps) => {
    return (
        <LynxClientProvider url={apiURL} apiKey={apiKey} bearer={bearer}>
            <UserProvider>
                {children}
            </UserProvider>
        </LynxClientProvider>
    );
};
