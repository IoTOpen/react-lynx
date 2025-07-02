import { useGlobalPermissions } from '../Contexts';
export const usePermissionsCheckAll = (...permissions) => {
    const currentPermissions = useGlobalPermissions();
    if (currentPermissions === undefined || currentPermissions === null)
        return false;
    return permissions.every(permission => currentPermissions[permission] !== undefined && currentPermissions[permission]);
};
export const usePermissionsCheckAny = (...permissions) => {
    const currentPermissions = useGlobalPermissions();
    if (currentPermissions === undefined || currentPermissions === null)
        return false;
    return permissions.some(permission => currentPermissions[permission] !== undefined && currentPermissions[permission]);
};
//# sourceMappingURL=useCheckPermissions.js.map