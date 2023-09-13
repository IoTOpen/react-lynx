import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, NotificationMessage} from '@iotopen/node-lynx';

export const useNotificationMessages = (installationId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [notificationMessages, setNotificationMessages] = useState<NotificationMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        lynxClient.getNotificationMessages(iid).then(res => {
            if (error !== undefined) setError(undefined);
            setNotificationMessages(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    },[error, iid, lynxClient]);

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
