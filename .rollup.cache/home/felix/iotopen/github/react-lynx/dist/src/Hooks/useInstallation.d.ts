import { Installation } from '@iotopen/node-lynx';
export declare const useInstallation: (installationId: number | string) => {
    installation: Installation;
    setInstallation: import("react").Dispatch<import("react").SetStateAction<Installation>>;
    update: () => Promise<Installation>;
    remove: () => Promise<Installation>;
    error: Error | undefined;
    loading: boolean;
};
