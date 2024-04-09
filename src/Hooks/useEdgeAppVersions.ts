import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeAppVersion, ErrorResponse} from '@iotopen/node-lynx';

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
        lynxClient.getEdgeAppVersions(id, untagged).then((versions) => {
            setError((err) => err !== undefined ? undefined : err);
            setVersions(versions);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, untagged]);

    const nameVersion = useCallback((name: string, hash: string) => {
        return lynxClient.nameEdgeAppVersion(id, name, hash);
    }, [lynxClient, id]);

    useLayoutEffect(() => {
        refresh();
    }, [id, untagged]);

    return {
        loading,
        error,
        versions,
        nameVersion,
        refresh
    };
};
