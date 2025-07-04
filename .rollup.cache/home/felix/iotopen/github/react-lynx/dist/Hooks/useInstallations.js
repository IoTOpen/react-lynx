import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
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