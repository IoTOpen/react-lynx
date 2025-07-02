import { EmptyFunctionx, Metadata } from '@iotopen/node-lynx';
export type FunctionTemplate = {
    type?: string;
    meta?: Metadata;
    protected_meta?: Metadata;
};
export declare const useNewFunction: (installationId: number | string, template?: FunctionTemplate) => {
    newFunction: EmptyFunctionx;
    setNewFunction: import("react").Dispatch<import("react").SetStateAction<EmptyFunctionx>>;
    create: () => Promise<import("@iotopen/node-lynx").Functionx>;
    setType: (t: string) => void;
};
