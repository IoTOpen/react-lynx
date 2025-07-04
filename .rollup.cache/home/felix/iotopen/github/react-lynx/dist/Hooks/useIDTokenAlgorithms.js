import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
// Removed local isErrorResponse definition, now using shared utility
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
        }).catch((e) => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        loading,
        refresh,
        algs,
        error,
    };
};
//# sourceMappingURL=useIDTokenAlgorithms.js.map