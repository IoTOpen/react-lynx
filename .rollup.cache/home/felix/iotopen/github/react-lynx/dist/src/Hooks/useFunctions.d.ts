import { EmptyFunctionx, ErrorResponse, Functionx, Metadata, OKResponse } from '@iotopen/node-lynx';
import { ObjectOrArray } from '../types';
export declare const useFunctions: (installationId: number | string, filter?: Metadata) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    create: <T extends EmptyFunctionx | EmptyFunctionx[]>(fns: T) => ObjectOrArray<Functionx, EmptyFunctionx, T>;
    remove: <T extends Functionx | Functionx[]>(fns: T) => ObjectOrArray<OKResponse, Functionx, T>;
    functions: Functionx[];
    refresh: () => void;
};
