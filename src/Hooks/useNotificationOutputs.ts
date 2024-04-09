import {useCallback, useEffect, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {ErrorResponse, NotificationOutput} from '@iotopen/node-lynx';

export const useNotificationOutputs = (installationId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [notificationOutputs, setNotificationOutputs] = useState<NotificationOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        lynxClient.getNotificationOutputs(iid).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setNotificationOutputs(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    },[iid, lynxClient]);

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