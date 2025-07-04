import { useCallback, useLayoutEffect, useState } from 'react';

import type { EdgeApp, ErrorResponse } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';

const zeroEdgeApp = {
    id: 0,
    created: 0,
    updated: 0,
    name: '',
    category: '',
    short_description: '',
    description: '',
    source_url: '',
    tags: [],
    publisher: { id: 0 },
    public: false,
    official: false
};

export const useEdgeApp = (appId: number | string) => {
    const id = typeof appId === 'string' ? Number.parseInt(appId) : appId;
    if (isNaN(id)) {
        throw new Error('invalid appId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [app, setApp] = useState<EdgeApp>({ ...zeroEdgeApp });

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApp(id).then(app => {
            setError((err) => err !== undefined ? undefined : err);
            setApp(app);
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

    }, [id, refresh]);

    return {
        loading,
        error,
        app,
        setApp,
        refresh
    };
};
