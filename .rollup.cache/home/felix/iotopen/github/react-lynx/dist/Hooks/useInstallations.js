import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useInstallations = (filter) => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [installations, setInstallations] = useState([]);
    const [error, setError] = useState();
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.listInstallations(filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setInstallations(res);
        }).catch(e => {
            setError(() => e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);
    useLayoutEffect(() => {
        refresh();
    }, [refresh]);
    return {
        loading,
        error,
        installations,
        refresh,
    };
};
//# sourceMappingURL=useInstallations.js.map