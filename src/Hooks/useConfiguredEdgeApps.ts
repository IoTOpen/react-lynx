import {useCallback, useLayoutEffect, useState} from 'react';

import type {EdgeAppInstance, ErrorResponse} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

export const useConfiguredEdgeApps = (installationId: number | string) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if(isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeAppInstance[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getConfiguredEdgeApps(id).then(fetchedApps => {
            setError((err) => err !== undefined ? undefined : err);
            setApps(fetchedApps);
        }).catch((e: unknown) => {
            if (isErrorResponse(e)) {
                setError(e);
            } else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id, lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        refresh,
        loading,
        error,
        apps,
    };
};
