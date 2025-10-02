import {useCallback, useLayoutEffect, useState} from 'react';

import type {EdgeApp, ErrorResponse} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';

export const useEdgeApps = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeApp[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApps().then(fetchedApps => {
            setError((err) => err !== undefined ? undefined : err);
            setApps(fetchedApps);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        apps,
        error,
        loading,
        refresh,
    };
};
