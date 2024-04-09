import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeApp, ErrorResponse} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

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
    publisher: {id: 0},
    public: false,
    official: false
};

export const useEdgeApp = (appId: number | string) => {
    const id = typeof appId === 'string' ? Number.parseInt(appId) : appId;
    if(isNaN(id)) {
        throw new Error('invalid appId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [app, setApp] = useState<EdgeApp>({...zeroEdgeApp});

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeApp(id).then(app => {
            setError((err) => err !== undefined ? undefined : err);
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
