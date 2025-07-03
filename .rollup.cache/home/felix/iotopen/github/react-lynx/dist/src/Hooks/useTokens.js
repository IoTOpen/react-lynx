import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useTokens = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [tokens, setTokens] = useState([]);
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
    const remove = useCallback((token) => {
        return lynxClient.deleteToken(token);
    }, [lynxClient]);
    const create = useCallback((token) => {
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
//# sourceMappingURL=useTokens.js.map