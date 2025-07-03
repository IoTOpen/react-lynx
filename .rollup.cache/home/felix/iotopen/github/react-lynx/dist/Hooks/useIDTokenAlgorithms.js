import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useIDTokenAlgorithms = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [algs, setAlgs] = useState([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getIDTokenAlgorithms().then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setAlgs(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);
    useEffect(() => {
        refresh();
    }, []);
    return {
        loading,
        refresh,
        algs,
        error,
    };
};
//# sourceMappingURL=useIDTokenAlgorithms.js.map