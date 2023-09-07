import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeApp, ErrorResponse} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

export const useEdgeApp = (appId: number | string) => {
    const id = typeof appId === 'string' ? Number.parseInt(appId) : appId;
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [app, setApp] = useState<EdgeApp>({
        id: 0,
        created: 0,
        updated: 0,
        name: '',
        category: '',
        short_description: '',
        description: '',
        source_url: '',
        tags: [],
        publisher: {id: 0},
        public: false,
        official: false
    });

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
        setApp,
        refresh
    };
};
