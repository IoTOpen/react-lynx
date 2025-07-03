import { EdgeApp, ErrorResponse } from '@iotopen/node-lynx';
export declare const useEdgeApps: () => {
    apps: EdgeApp[];
    error: ErrorResponse | undefined;
    loading: boolean;
    refresh: () => void;
};
