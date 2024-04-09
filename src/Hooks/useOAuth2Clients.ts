import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, OAuth2Client} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

export const useOAuth2Clients = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [clients, setClients] = useState<OAuth2Client[]>([]);
    const refresh = useCallback(() => {
        lynxClient.getOAuth2Clients().then(clients => {
            setError((err) => err !== undefined ? undefined : err);
            setClients(clients);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        refresh,
        clients,
        error,
        loading
    };
};
