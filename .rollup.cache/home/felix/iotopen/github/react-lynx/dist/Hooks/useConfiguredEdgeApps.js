import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useConfiguredEdgeApps = (installationId) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [apps, setApps] = useState([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getConfiguredEdgeApps(id).then(apps => {
            setError((err) => err !== undefined ? undefined : err);
            setApps(apps);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [id, lynxClient]);
    useLayoutEffect(() => {
        refresh();
    }, [refresh]);
    return {
        refresh: refresh,
        loading: loading,
        error: error,
        apps: apps,
    };
};
//# sourceMappingURL=useConfiguredEdgeApps.js.map