import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, NotificationOutputExecutor} from '@iotopen/node-lynx';

export const useNotificationOutputExecutors = (installationId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [notificationExecutors, setNotificationExecutors] = useState<NotificationOutputExecutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        lynxClient.getNotificationOutputExecutors(iid).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setNotificationExecutors(res);
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
        notificationExecutors,
        error,
        loading,
    };
};
