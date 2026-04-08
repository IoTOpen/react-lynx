import { useCallback, useEffect, useState } from 'react';

import type { ErrorResponse, NotificationOutput } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

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
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState<NotificationOutput>({
        ...zeroNotificationOutput,
        config: { ...zeroNotificationOutput.config }
    });
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        if (iid === 0 || id === 0) {return;}
        setLoading(true);
        lynxClient.getNotificationOutput(iid, id).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setOutput(res);
        }).catch(e => {
            setError(e as ErrorResponse);
        }).finally(() => {
            setLoading(false);
        });
    }, [id, iid, lynxClient]);

    const update = useCallback(() => {
        if (error !== undefined) {setError(undefined);}
        return lynxClient.updateNotificationOutput(output).then(res => {
            setOutput(res);
            return res;
        }).catch(e => {
            setError(e as ErrorResponse);
        });
    }, [error, lynxClient, output]);

    const remove = useCallback(() => {
        return lynxClient.deleteNotificationOutput(output).then((res) => {
            setOutput({ ...zeroNotificationOutput });
            return res;
        }).catch(e => {
            setError(e as ErrorResponse);
        });
    }, [lynxClient, output]);

    useEffect(() => {
        queueMicrotask(refresh);
    }, [refresh]);

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
