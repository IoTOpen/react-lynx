import { useCallback, useEffect, useState } from 'react';

import { type ErrorResponse, type OAuth2Client, zero } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

export const useOAuth2Client = (id: string) => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [client, setClient] = useState<OAuth2Client>({ ...zero.getOAuth2Client() });
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getOAuth2Client(id).then(fetchedClient => {
            setError((err) => err !== undefined ? undefined : err);
            setClient(fetchedClient);
        }).catch(e => {
            setError(e as ErrorResponse);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id]);

    useEffect(() => {
        queueMicrotask(refresh);
    }, [refresh]);

    const remove = useCallback(() => {
        return lynxClient.deleteOAuth2Client(client);
    }, [client, lynxClient]);

    const update = useCallback(() => {
        return lynxClient.updateOAuth2Client(client);
    }, [client, lynxClient]);

    return {
        refresh,
        client,
        setClient,
        error,
        loading,
        remove,
        update,
    };
};
