import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, OAuth2Client} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

export const useOAuth2Client = (id: string) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [client, setClient] = useState<OAuth2Client>({
        created: 0,
        updated: 0,
        name: '',
        id: '',
        client_secret: '',
        trusted: false,
        allowed_scopes: [],
        icon_uri: '',
        policy_uri: '',
        tos_uri: '',
        redirect_uris: [],
    });
    const refresh = useCallback(() => {
        if(!loading) setLoading(true);
        lynxClient.getOAuth2Client(id).then(client => {
            if (error !== undefined) setError(undefined);
            setClient(client);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [loading, lynxClient, id, error]);

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
