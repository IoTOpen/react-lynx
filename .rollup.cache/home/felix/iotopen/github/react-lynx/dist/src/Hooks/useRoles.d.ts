import { Role } from '@iotopen/node-lynx';
export declare const useRoles: () => {
    loading: boolean;
    error: Error | undefined;
    roles: Role[];
    refresh: () => void;
};
