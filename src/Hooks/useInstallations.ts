import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useLayoutEffect, useState} from 'react';
import {ErrorResponse, Installation, Metadata} from '@iotopen/node-lynx';

export const useInstallations = (filter?: Metadata) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.listInstallations(filter).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setInstallations(res);
        }).catch(e => {
            setError(() => e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);

    useLayoutEffect(() => {
        refresh();
    }, [refresh]);

    return {
        loading,
        error,
        installations,
        refresh,
    };
};