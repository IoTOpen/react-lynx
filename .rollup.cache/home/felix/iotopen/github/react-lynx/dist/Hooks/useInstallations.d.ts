import { ErrorResponse, Installation, Metadata } from '@iotopen/node-lynx';
export declare const useInstallations: (filter?: Metadata) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    installations: Installation[];
    refresh: () => void;
};
