import { useCallback, useLayoutEffect, useState } from 'react';

import type { EdgeAppInstance, ErrorResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

export const useConfiguredEdgeApps = (installationId: number | string) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if(isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeAppInstance[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getConfiguredEdgeApps(id).then(fetchedApps => {
            setError((err) => err !== undefined ? undefined : err);
            setApps(fetchedApps);
        }).catch(e => {
            setError(e);
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
