import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { useOAuth2Client } from './useOAuth2Client';
export const useOAuth2Consent = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [requestedScopes, setRequestedScopes] = useState([]);
    const [params] = useState(new URLSearchParams(window.location.search));
    const { client } = useOAuth2Client(params.get('client_id') ?? '');
    const consent = useCallback((scope) => {
        const consentObject = Object.fromEntries(params);
        consentObject.scope = scope.join(' ');
        return lynxClient.consentOAuth2Authorization(consentObject);
    }, [lynxClient, params]);
    useEffect(() => {
        setRequestedScopes(params.get('scope')?.split(' ') ?? []);
    }, [params]);
    return {
        consent,
        client,
        requestedScopes
    };
};
//# sourceMappingURL=useOAuth2Consent.js.map