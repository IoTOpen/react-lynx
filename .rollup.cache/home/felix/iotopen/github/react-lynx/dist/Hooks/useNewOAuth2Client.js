import { zero } from '@iotopen/node-lynx';
import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useNewOAuth2Client = (template) => {
    const { lynxClient } = useGlobalLynxClient();
    const [client, setClient] = useState({
        ...zero.getEmptyOAuth2Client(),
        ...template,
    });
    const setName = useCallback((name) => {
        setClient({ ...client, name: name });
    }, [client]);
    const setScope = useCallback((scopes) => {
        setClient({ ...client, allowed_scopes: scopes });
    }, [client]);
    const setIconURI = useCallback((uri) => {
        setClient({ ...client, icon_uri: uri });
    }, [client]);
    const setTosURI = useCallback((uri) => {
        setClient({ ...client, tos_uri: uri });
    }, [client]);
    const setPolicyURI = useCallback((uri) => {
        setClient({ ...client, policy_uri: uri });
    }, [client]);
    const setRedirectURIs = useCallback((uris) => {
        setClient({ ...client, redirect_uris: uris });
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
//# sourceMappingURL=useNewOAuth2Client.js.map