import { useCallback, useEffect, useRef, useState } from 'react';

import type { ErrorResponse, OAuth2Client } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

export const useOAuth2Clients = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [clients, setClients] = useState<OAuth2Client[]>([]);
    const latestRequest = useRef(0);

    const refreshCall = useCallback((resetData = false) => {
        const request = ++latestRequest.current;

        void Promise.resolve().then(() => {
            if (request !== latestRequest.current) {return;}

            setLoading(true);
            setError(undefined);
            if (resetData) {
                setClients([]);
            }

            void lynxClient.getOAuth2Clients().then(fetchedClients => {
                if (request === latestRequest.current) {
                    setClients(fetchedClients);
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
    }, [lynxClient]);

    useEffect(() => {
        return refreshCall(true);
    }, [refreshCall]);

    const refresh = useCallback(() => {
        void refreshCall();
    }, [refreshCall]);

    return {
        refresh,
        clients,
        error,
        loading
    };
};
