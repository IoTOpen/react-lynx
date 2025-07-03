import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
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
        }).catch(e => {
            setError(e);
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