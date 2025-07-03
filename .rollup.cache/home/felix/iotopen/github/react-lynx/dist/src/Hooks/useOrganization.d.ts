import { Organization } from '@iotopen/node-lynx';
export declare const useOrganization: (organizationId: number | string) => {
    loading: boolean;
    organization: Organization;
    setOrganization: import("react").Dispatch<import("react").SetStateAction<Organization>>;
    error: Error | undefined;
    update: () => Promise<Organization>;
    remove: () => Promise<import("@iotopen/node-lynx").OKResponse>;
    refresh: () => void;
};
