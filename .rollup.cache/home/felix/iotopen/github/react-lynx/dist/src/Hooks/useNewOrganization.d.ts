import { Address, EmptyOrganization, Metadata, OrganizationChild } from '@iotopen/node-lynx';
export type OrganizationTemplate = {
    address?: Address;
    children?: OrganizationChild[];
    email?: string;
    force_sms_login?: boolean;
    phone?: string;
    name?: string;
    notes?: string;
    password_valid_days?: number;
    meta?: Metadata;
    protected_meta?: Metadata;
};
export declare const useNewOrganization: (parentId: number | string, template?: OrganizationTemplate) => {
    newOrganization: EmptyOrganization;
    setNewOrganization: import("react").Dispatch<import("react").SetStateAction<EmptyOrganization>>;
    create: () => Promise<import("@iotopen/node-lynx").Organization>;
};
