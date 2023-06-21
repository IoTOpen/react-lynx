import {useCallback, useEffect, useState} from 'react';
import {useGlobalLynxClient} from '@iotopen/react-lynx';
import {useOAuth2Client} from './useOAuth2Client';

export const useOAuth2Consent = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [requestedScopes, setRequestedScopes] = useState<string[]>([]);
    const [params] = useState(new URLSearchParams(window.location.search));
    const {client} = useOAuth2Client(params.get('client_id') ?? '');

    const consent = useCallback((scope: string[]) => {
        const consentObject = Object.fromEntries(params);

        consentObject.scope = scope.join(' ');
        return lynxClient.consentOAuth2Authorization(consentObject);
    },[lynxClient, params]);

    useEffect(() => {
        setRequestedScopes(params.get('scope')?.split(' ') ?? []);
    }, [params]);

    return {
        consent,
        client,
        requestedScopes
    };
};
