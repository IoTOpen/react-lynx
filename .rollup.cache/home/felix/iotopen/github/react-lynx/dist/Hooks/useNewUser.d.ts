import { EmptyUser } from '@iotopen/node-lynx';
import { Address } from '@iotopen/node-lynx/src/types';
export type UserTemplate = {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    role?: number;
    sms_login?: boolean;
    mobile?: string;
    note?: string;
    organisations?: number[];
    assigned_installations?: number[];
    address?: Address;
    expire_at?: number;
    meta?: {
        [key: string]: any;
    };
    protected_meta?: {
        [key: string]: any;
    };
};
export declare const useNewUser: (template?: UserTemplate) => {
    newUser: EmptyUser;
    setNewUser: import("react").Dispatch<import("react").SetStateAction<EmptyUser>>;
    create: () => Promise<import("@iotopen/node-lynx").User>;
};
