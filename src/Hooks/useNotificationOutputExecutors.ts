import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErrorResponse, NotificationOutputExecutor } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

import { parseResourceId } from './resourceId';

export const useNotificationOutputExecutors = (installationId: number | string) => {
    const iid = parseResourceId(installationId, 'installationId');
    const { lynxClient } = useGlobalLynxClient();
    const [notificationExecutors, setNotificationExecutors] = useState<NotificationOutputExecutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const latestRequest = useRef(0);

    const refreshCall = useCallback((resetData = false) => {
        const request = ++latestRequest.current;

        void Promise.resolve().then(() => {
            if (request !== latestRequest.current) {return;}

            setLoading(true);
            setError(undefined);
            if (resetData) {
                setNotificationExecutors([]);
            }

            void lynxClient.getNotificationOutputExecutors(iid).then(res => {
                if (request === latestRequest.current) {
                    setNotificationExecutors(res);
                }
            }).catch((e: unknown) => {
                if (request === latestRequest.current) {
                    setError(e as ErrorResponse);
                }
            }).finally(() => {
                if (request === latestRequest.current) {
                    setLoading(false);
                }
            });
        });

        return () => {latestRequest.current += 1;};
    }, [iid, lynxClient]);

    useEffect(() => {
        return refreshCall(true);
    }, [refreshCall]);

    const refresh = useCallback(() => {
        void refreshCall();
    }, [refreshCall]);

    return {
        refresh,
        notificationExecutors,
        error,
        loading,
    };
};
