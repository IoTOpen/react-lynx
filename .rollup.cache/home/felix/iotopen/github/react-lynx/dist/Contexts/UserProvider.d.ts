import { ErrorResponse, User } from '@iotopen/node-lynx';
import { ReactNode } from 'react';
interface userContext {
    user: User | null;
    permissions: {
        [key: string]: boolean;
    } | null;
    error: ErrorResponse | undefined;
    loading: boolean;
}
interface UserProviderProps {
    children: ReactNode;
}
export declare const UserProvider: ({ children }: UserProviderProps) => import("react/jsx-runtime").JSX.Element;
export declare const useGlobalUser: () => userContext;
export declare const useGlobalPermissions: () => {
    [key: string]: boolean;
} | null;
export {};
