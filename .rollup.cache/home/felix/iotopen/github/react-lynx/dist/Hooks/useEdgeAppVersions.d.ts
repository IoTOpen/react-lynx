import { EdgeAppVersion, ErrorResponse } from '@iotopen/node-lynx';
export declare const useEdgeAppVersions: (appId: number | string, untagged?: boolean) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    versions: EdgeAppVersion[];
    nameVersion: (name: string, hash: string) => Promise<EdgeAppVersion>;
    refresh: () => void;
};
