import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
// Removed local isErrorResponse definition, now using shared utility
export const useOrganizations = (minimal) => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [organizations, setOrganizations] = useState([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOrganizations(minimal === true).then(orgs => {
            setError((err) => err !== undefined ? undefined : err);
            setOrganizations(orgs);
        }).catch((e) => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, minimal]);
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const create = useCallback((org) => {
        return lynxClient.createOrganization(org);
    }, [lynxClient]);
    const remove = useCallback((org) => {
        return lynxClient.deleteOrganization(org);
    }, [lynxClient]);
    return {
        loading,
        organizations,
        setOrganizations,
        error,
        create,
        remove,
    };
};
//# sourceMappingURL=useOrganizations.js.map