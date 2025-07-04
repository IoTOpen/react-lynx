import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
export const useNotificationOutputs = (installationId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [notificationOutputs, setNotificationOutputs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const refresh = useCallback(() => {
        lynxClient.getNotificationOutputs(iid).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setNotificationOutputs(res);
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
    }, [iid, lynxClient]);
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        refresh,
        notificationOutputs,
        error,
        loading,
    };
};
//# sourceMappingURL=useNotificationOutputs.js.map