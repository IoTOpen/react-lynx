import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {EmptyToken, ErrorResponse, Token} from '@iotopen/node-lynx';

export const useTokens = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [tokens, setTokens] = useState<Token[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getTokens().then((tokens) => {
            setError((err) => err !== undefined ? undefined : err);
            setTokens(tokens);
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
        tokens: tokens,
        remove: remove,
        create: create,
        refresh: refresh,
        loading: loading,
        error: error
    };
};
