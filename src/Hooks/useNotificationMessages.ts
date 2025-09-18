import {useCallback, useEffect, useState} from 'react';

import type {ErrorResponse, NotificationMessage} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

// Removed local isErrorResponse definition, now using shared utility

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
            setError((err) => err !== undefined ? undefined : err);
            setNotificationMessages(res);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
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
