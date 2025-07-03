import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
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
        }).catch(e => {
            setError(e);
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