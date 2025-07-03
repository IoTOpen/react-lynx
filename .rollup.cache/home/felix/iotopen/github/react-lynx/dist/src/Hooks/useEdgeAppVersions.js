import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useEdgeAppVersions = (appId, untagged) => {
    const id = typeof appId === 'string' ? Number.parseInt(appId) : appId;
    if (isNaN(id)) {
        throw new Error('invalid appId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [versions, setVersions] = useState([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeAppVersions(id, untagged).then((versions) => {
            setError((err) => err !== undefined ? undefined : err);
            setVersions(versions);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id, untagged]);
    const nameVersion = useCallback((name, hash) => {
        return lynxClient.nameEdgeAppVersion(id, name, hash);
    }, [lynxClient, id]);
    useLayoutEffect(() => {
        refresh();
    }, [id, refresh, untagged]);
    return {
        loading,
        error,
        versions,
        nameVersion,
        refresh
    };
};
//# sourceMappingURL=useEdgeAppVersions.js.map