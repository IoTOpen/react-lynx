import {useCallback, useState} from 'react';
import {EmptyOAuth2Client} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';
import {zeroOAuth2Client} from './useOAuth2Client';

export const useNewOAuth2Client = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [client, setClient] = useState<EmptyOAuth2Client>({...zeroOAuth2Client});

    const setName = useCallback((name: string) => {
        setClient({...client, name: name});
    }, [client]);

    const setScope = useCallback((scopes: string[]) => {
        setClient({...client, allowed_scopes: scopes});
    }, [client]);

    const setIconURI = useCallback((uri: string) => {
        setClient({...client, icon_uri: uri});
    }, [client]);

    const setTosURI = useCallback((uri: string) => {
        setClient({...client, tos_uri: uri});
    }, [client]);

    const setPolicyURI = useCallback((uri: string) => {
        setClient({...client, policy_uri: uri});
    }, [client]);

    const setRedirectURIs = useCallback((uris: string[]) => {
        setClient({...client, redirect_uris: uris});
    }, [client]);

    const create = useCallback(() => {
        return lynxClient.createOAuth2Client(client);
    }, [lynxClient, client]);

    return {
        newClient: client,
        create,
        setName,
        setScope,
        setIconURI,
        setTosURI,
        setPolicyURI,
        setRedirectURIs,
        setClient,
    };
};
