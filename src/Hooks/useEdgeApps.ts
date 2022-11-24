import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeApp, ErrorResponse} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

export const useEdgeApps = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeApp[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApps().then(apps => {
            if (error !== undefined) setError(undefined);
            setApps(apps);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [error, lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, []);

    return {
        apps,
        error,
        loading,
        refresh,
    };
};
