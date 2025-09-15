import {useCallback, useLayoutEffect, useState} from 'react';

import type {EmptyToken, ErrorResponse, Token} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

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
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 0, message: 'Unknown error occurred while fetching tokens.' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    const remove = useCallback((token: Token) => lynxClient.deleteToken(token), [lynxClient]);

    const create = useCallback((token: EmptyToken) => lynxClient.createToken(token), [lynxClient]);

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
