import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErrorResponse, NotificationOutput } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

import { parseResourceId } from './resourceId';

export const useNotificationOutputs = (installationId: number | string) => {
    const iid = parseResourceId(installationId, 'installationId');
    const { lynxClient } = useGlobalLynxClient();
    const [notificationOutputs, setNotificationOutputs] = useState<NotificationOutput[]>([]);
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
                setNotificationOutputs([]);
            }

            void lynxClient.getNotificationOutputs(iid).then(res => {
                if (request === latestRequest.current) {
                    setNotificationOutputs(res);
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
        notificationOutputs,
        error,
        loading,
    };
};
