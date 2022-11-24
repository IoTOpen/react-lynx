import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeApp, ErrorResponse} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

export const useEdgeApp = (id: number) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [app, setApp] = useState<EdgeApp | undefined>();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApp(id).then(app => {
            if (error !== undefined) setError(undefined);
            setApp(app);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [id, lynxClient]);

    useLayoutEffect(() => {
        refresh();
    }, [id]);

    return {
        loading,
        error,
        app,
        refresh
    };
};
