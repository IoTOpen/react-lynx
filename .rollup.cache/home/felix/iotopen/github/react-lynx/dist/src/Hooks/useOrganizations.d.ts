import { ErrorResponse, MinimalOrg, Organization } from '@iotopen/node-lynx';
export declare const useOrganizations: <T extends boolean = false>(minimal?: T) => {
    loading: boolean;
    organizations: MinimalOrg<T>[];
    setOrganizations: import("react").Dispatch<import("react").SetStateAction<MinimalOrg<T>[]>>;
    error: ErrorResponse | undefined;
    create: (org: Organization) => Promise<Organization>;
    remove: (org: Organization) => Promise<import("@iotopen/node-lynx").OKResponse>;
};
