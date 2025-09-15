import { useCallback, useLayoutEffect, useState } from 'react';

import type { EdgeApp, ErrorResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

export const useEdgeApps = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [apps, setApps] = useState<EdgeApp[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApps().then(fetchedApps => {
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
