import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useInstallationInfo = (assignedOnly) => {
    const { lynxClient } = useGlobalLynxClient();
    const [installations, setInstallations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);
    const refreshCall = useCallback(() => {
        setLoading(true);
        lynxClient.getInstallations(assignedOnly).then((res) => {
            setError((err) => err !== undefined ? undefined : err);
            setInstallations(res);
        }).catch((e) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient]);
    useLayoutEffect(() => {
        refreshCall();
    }, [refreshCall]);
    return {
        installations: installations,
        refresh: refreshCall,
        loading: loading,
        error: error,
    };
};
//# sourceMappingURL=useInstallationInfo.js.map