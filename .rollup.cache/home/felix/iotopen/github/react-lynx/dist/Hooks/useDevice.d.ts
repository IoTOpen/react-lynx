import { Devicex, ErrorResponse, MetaObject, OKResponse } from '@iotopen/node-lynx';
export declare const useDevice: (installationId: number | string, deviceId: number | string) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    Device: Devicex;
    setDevice: import("react").Dispatch<import("react").SetStateAction<Devicex>>;
    update: () => Promise<Devicex>;
    remove: () => Promise<OKResponse>;
    setType: (t: string) => void;
};
export declare const useDeviceMeta: (installationId: number | string, deviceId?: number | string) => {
    createMeta: (key: string, meta: MetaObject, devId?: number, silent?: boolean) => Promise<MetaObject>;
    updateMeta: (key: string, meta: MetaObject, createMissing?: boolean, devId?: number, silent?: boolean) => Promise<MetaObject>;
    removeMeta: (key: string, devId?: number, silent?: boolean) => Promise<MetaObject>;
};
