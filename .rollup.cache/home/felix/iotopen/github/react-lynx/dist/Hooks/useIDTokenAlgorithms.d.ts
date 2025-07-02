import { ErrorResponse } from '@iotopen/node-lynx';
export declare const useIDTokenAlgorithms: () => {
    loading: boolean;
    refresh: () => void;
    algs: string[];
    error: ErrorResponse | undefined;
};
