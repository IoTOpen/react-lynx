import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';


export const useIDTokenAlgorithms = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [algs, setAlgs] = useState<string[]>([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getIDTokenAlgorithms().then(res => {
            if (error !== undefined) setError(undefined);
            setAlgs(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [error, lynxClient]);

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