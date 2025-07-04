import {useCallback, useLayoutEffect, useState} from 'react';

import type {ErrorResponse, Installation, Metadata} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

export const useInstallations = (filter?: Metadata) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.listInstallations(filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setInstallations(res);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        loading,
        error,
        installations,
        refresh,
    };
};