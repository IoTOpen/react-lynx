import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {EdgeAppVersion, ErrorResponse} from '@iotopen/node-lynx';

export const useEdgeAppVersions = (appId: number, untagged?: boolean) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorResponse | undefined>();
    const [versions, setVersions] = useState<EdgeAppVersion[]>([]);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getEdgeAppVersions(appId, untagged).then((versions) => {
            if (error !== undefined) setError(undefined);
            setVersions(versions);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, untagged]);

    const nameVersion = useCallback((name: string, hash: string) => {
        return lynxClient.nameEdgeAppVersion(appId, name, hash);
    }, [lynxClient, appId]);

    useLayoutEffect(() => {
        refresh();
    }, [appId, untagged]);

    return {
        loading,
        error,
        versions,
        nameVersion,
        refresh
    };
};
