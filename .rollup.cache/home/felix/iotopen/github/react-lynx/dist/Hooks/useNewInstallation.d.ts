import { EmptyInstallation, Metadata } from '@iotopen/node-lynx';
export type InstallationTemplate = {
    name?: string;
    notes?: string;
    meta?: Metadata;
    protected_meta?: Metadata;
};
export declare const useNewInstallation: (organizationId: number | string, template?: InstallationTemplate) => {
    newInstallation: EmptyInstallation;
    setNewInstallation: import("react").Dispatch<import("react").SetStateAction<EmptyInstallation>>;
    create: () => Promise<import("@iotopen/node-lynx").Installation>;
};
