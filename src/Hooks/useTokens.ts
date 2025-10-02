import {useCallback, useLayoutEffect, useState} from 'react';

import type {EmptyToken, ErrorResponse, Token} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';

export const useTokens = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [tokens, setTokens] = useState<Token[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getTokens().then((fetchedTokens) => {
            setError((err) => err !== undefined ? undefined : err);
            setTokens(fetchedTokens);
        }).catch((e) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    const remove = useCallback((token: Token) => {
        return lynxClient.deleteToken(token);
    }, [lynxClient]);

    const create = useCallback((token: EmptyToken) => {
        return lynxClient.createToken(token);
    }, [lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        tokens,
        remove,
        create,
        refresh,
        loading,
        error
    };
};
