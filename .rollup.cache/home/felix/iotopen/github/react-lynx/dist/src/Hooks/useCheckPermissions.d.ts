import { Permissions } from '@iotopen/node-lynx';
export type Permission = Permissions | string;
export declare const usePermissionsCheckAll: (...permissions: Permission[]) => boolean;
export declare const usePermissionsCheckAny: (...permissions: Permission[]) => boolean;
