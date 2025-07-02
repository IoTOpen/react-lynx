import { ReactNode } from 'react';
type LynxProviderProps = {
    apiURL?: string;
    apiKey?: string;
    bearer?: boolean;
    children?: ReactNode;
};
export declare const LynxProvider: ({ children, apiURL, apiKey, bearer }: LynxProviderProps) => import("react/jsx-runtime").JSX.Element;
export {};
