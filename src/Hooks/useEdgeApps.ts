import { EdgeApp, ErrorResponse } from '@iotopen/node-lynx';
import { useCallback, useLayoutEffect, useState } from 'react';

import { useGlobalLynxClient } from '../Contexts';

export const useEdgeApps = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeApp[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApps().then(apps => {
            setError((err) => err !== undefined ? undefined : err);
            setApps(apps);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);


    useLayoutEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        apps,
        error,
        loading,
        refresh,
    };
};
