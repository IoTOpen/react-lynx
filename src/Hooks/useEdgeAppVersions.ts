import {useCallback, useLayoutEffect, useState} from 'react';

import type {EdgeAppVersion, ErrorResponse} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';

export const useEdgeAppVersions = (appId: number | string, untagged?: boolean) => {
    const id = typeof appId === 'string' ? Number.parseInt(appId) : appId;
    if(isNaN(id)) {
        throw new Error('invalid appId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [versions, setVersions] = useState<EdgeAppVersion[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeAppVersions(id, untagged).then((fetchedVersions) => {
            setError((err) => err !== undefined ? undefined : err);
            setVersions(fetchedVersions);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id, untagged]);

    const nameVersion = useCallback((name: string, hash: string) => {
        return lynxClient.nameEdgeAppVersion(id, name, hash);
    }, [lynxClient, id]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        loading,
        error,
        versions,
        nameVersion,
        refresh
    };
};
