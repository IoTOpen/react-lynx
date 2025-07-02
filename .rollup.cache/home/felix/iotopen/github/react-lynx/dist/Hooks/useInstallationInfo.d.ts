import { ErrorResponse, InstallationInfo } from '@iotopen/node-lynx';
export declare const useInstallationInfo: (assignedOnly?: boolean) => {
    installations: InstallationInfo[];
    refresh: () => void;
    loading: boolean;
    error: ErrorResponse | undefined;
};
