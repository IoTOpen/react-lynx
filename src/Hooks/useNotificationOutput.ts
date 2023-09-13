import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, NotificationOutput} from '@iotopen/node-lynx';

const zeroNotificationOutput = {
    id: 0,
    installation_id: 0,
    name: '',
    notification_message_id: 0,
    notification_output_executor_id: 0,
    config: {},
};

export const useNotificationOutput = (installationId: number | string, notificationId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof notificationId === 'string' ? Number.parseInt(notificationId) : notificationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    if (isNaN(id)) {
        throw new Error('invalid notificationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState<NotificationOutput>({
        ...zeroNotificationOutput,
        config: {...zeroNotificationOutput.config}
    });
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        if(iid === 0 || id === 0) return;
        setLoading(true);
        lynxClient.getNotificationOutput(iid, id).then(res => {
            if (error !== undefined) setError(undefined);
            setOutput(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [error, id, iid, lynxClient]);

    const update = useCallback(() => {
        if (error !== undefined) setError(undefined);
        lynxClient.updateNotificationOutput(output).then(res => {
            setOutput(res);
        }).catch(e => {
            setError(e);
        });
    }, [error, lynxClient, output]);

    const remove = useCallback(() => {
        lynxClient.deleteNotificationOutput(output).then(() => {
            setOutput({...zeroNotificationOutput});
        }).catch(e => {
            setError(e);
        });
    }, [lynxClient, output]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        refresh,
        output,
        setOutput,
        error,
        loading,
        remove,
        update
    };
};