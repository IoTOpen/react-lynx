import {useCallback, useEffect, useState} from 'react';

import type {ErrorResponse, OAuth2Client} from '@iotopen/node-lynx';
import { zero} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

export const useOAuth2Client = (id: string) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [client, setClient] = useState<OAuth2Client>({...zero.getOAuth2Client()});
    const refresh = useCallback(() => {
        if (!loading) setLoading(true);
        lynxClient.getOAuth2Client(id).then(client => {
            setError((err) => err !== undefined ? undefined : err);
            setClient(client);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [loading, lynxClient, id]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
