import {Permissions} from '@iotopen/node-lynx';
import {useGlobalPermissions} from '../Contexts';


export type Permission = Permissions | string

export const usePermissionsCheckAll = (...permissions: Permission[]): boolean => {
    const currentPermissions = useGlobalPermissions();
    if (currentPermissions === undefined || currentPermissions === null) return false;
    return permissions.every(permission => currentPermissions[permission] !== undefined && currentPermissions[permission]);
};


export const usePermissionsCheckAny = (...permissions: Permission[]): boolean => {
    const currentPermissions = useGlobalPermissions();
    if (currentPermissions === undefined || currentPermissions === null) return false;
    return permissions.some(permission => currentPermissions[permission] !== undefined && currentPermissions[permission]);
};
