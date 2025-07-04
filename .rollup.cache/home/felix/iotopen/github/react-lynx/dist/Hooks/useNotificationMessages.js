import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
// Removed local isErrorResponse definition, now using shared utility
export const useNotificationMessages = (installationId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [notificationMessages, setNotificationMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const refresh = useCallback(() => {
        lynxClient.getNotificationMessages(iid).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setNotificationMessages(res);
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
        notificationMessages,
        error,
        loading,
    };
};
//# sourceMappingURL=useNotificationMessages.js.map