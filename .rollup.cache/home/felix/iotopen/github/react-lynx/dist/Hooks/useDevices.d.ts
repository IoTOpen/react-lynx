import { Devicex, EmptyDevicex, ErrorResponse, Metadata, OKResponse } from '@iotopen/node-lynx';
import { ObjectOrArray } from '../types';
export declare const useDevices: (installationId: number | string, filter?: Metadata) => {
    loading: boolean;
    error: ErrorResponse | undefined;
    create: <T extends EmptyDevicex | EmptyDevicex[]>(devs: T) => ObjectOrArray<Devicex, EmptyDevicex, T>;
    remove: <T extends Devicex | Devicex[]>(devs: T) => ObjectOrArray<OKResponse, Devicex, T>;
    devices: Devicex[];
    refresh: () => void;
};
