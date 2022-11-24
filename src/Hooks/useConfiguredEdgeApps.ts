import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeAppInstance, ErrorResponse} from '@iotopen/node-lynx';

export const useConfiguredEdgeApps = (installationId: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeAppInstance[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getConfiguredEdgeApps(installationId).then(apps => {
            if (error !== undefined) setError(undefined);
            setApps(apps);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [installationId, lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        refresh: refresh,
        loading: loading,
        error: error,
        apps: apps,
    };
};
