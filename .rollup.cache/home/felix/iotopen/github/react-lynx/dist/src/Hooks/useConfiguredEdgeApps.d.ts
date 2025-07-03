import { EdgeAppInstance, ErrorResponse } from '@iotopen/node-lynx';
export declare const useConfiguredEdgeApps: (installationId: number | string) => {
    refresh: () => void;
    loading: boolean;
    error: ErrorResponse | undefined;
    apps: EdgeAppInstance[];
};
