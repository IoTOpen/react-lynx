import { EmptyDevicex, Metadata } from '@iotopen/node-lynx';
export type DeviceTemplate = {
    type?: string;
    meta?: Metadata;
    protected_meta?: Metadata;
};
export declare const useNewDevice: (installationId: number | string, template?: DeviceTemplate) => {
    newDevice: EmptyDevicex;
    setNewDevice: import("react").Dispatch<import("react").SetStateAction<EmptyDevicex>>;
    create: () => Promise<import("@iotopen/node-lynx").Devicex>;
    setType: (t: string) => void;
};
