import {useCallback, useEffect, useState} from 'react';

import type {ErrorResponse} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

// Removed local isErrorResponse definition, now using shared utility

export const useIDTokenAlgorithms = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [algs, setAlgs] = useState<string[]>([]);
    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getIDTokenAlgorithms().then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setAlgs(res);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
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