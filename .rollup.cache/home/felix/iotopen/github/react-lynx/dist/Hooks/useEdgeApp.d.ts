import { EdgeApp, ErrorResponse } from '@iotopen/node-lynx';
export declare const useEdgeApp: (appId: number | string) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    app: EdgeApp;
    setApp: import("react").Dispatch<import("react").SetStateAction<EdgeApp>>;
    refresh: () => void;
};
