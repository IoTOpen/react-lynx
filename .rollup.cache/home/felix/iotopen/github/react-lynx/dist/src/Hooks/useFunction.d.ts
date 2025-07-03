import { ErrorResponse, Functionx, MetaObject } from '@iotopen/node-lynx';
export declare const useFunction: (installationId: number | string, functionId: number | string) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    Function: Functionx;
    setFunction: import("react").Dispatch<import("react").SetStateAction<Functionx>>;
    update: () => Promise<Functionx>;
    remove: () => Promise<import("@iotopen/node-lynx").OKResponse>;
    setType: (t: string) => void;
};
export declare const useFunctionMeta: (installationId: number | string, functionId?: number | string) => {
    createMeta: (key: string, meta: MetaObject, funId?: number, silent?: boolean) => Promise<MetaObject>;
    updateMeta: (key: string, meta: MetaObject, createMissing?: boolean, funId?: number, silent?: boolean) => Promise<MetaObject>;
    removeMeta: (key: string, funId?: number, silent?: boolean) => Promise<MetaObject>;
};
