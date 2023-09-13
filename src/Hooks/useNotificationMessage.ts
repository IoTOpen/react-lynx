import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, NotificationMessage} from '@iotopen/node-lynx';

const zeroNotificationMessage= {
    id: 0,
    installation_id: 0,
    name: '',
    text: ''
};

export const useNotificationMessage = (installationId: number | string, notificationId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof notificationId === 'string' ? Number.parseInt(notificationId) : notificationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    if (isNaN(id)) {
        throw new Error('invalid messageId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<NotificationMessage>({
        ...zeroNotificationMessage,
    });
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        if(iid === 0 || id === 0) return;
        setLoading(true);
        lynxClient.getNotificationMessage(iid, id).then(res => {
            if (error !== undefined) setError(undefined);
            setMessage(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [error, id, iid, lynxClient]);

    const update = useCallback(() => {
        if (error !== undefined) setError(undefined);
        lynxClient.updateNotificationMessage(message).then(res => {
            setMessage(res);
        }).catch(e => {
            setError(e);
        });
    }, [error, lynxClient, message]);

    const remove = useCallback(() => {
        lynxClient.deleteNotificationMessage(message).then(() => {
            setMessage({...zeroNotificationMessage});
        }).catch(e => {
            setError(e);
        });
    }, [lynxClient, message]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        refresh,
        message,
        setMessage,
        error,
        loading,
        remove,
        update
    };
};