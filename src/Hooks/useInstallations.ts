import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useState} from 'react';
import {ErrorResponse, Installation, Metadata} from '@iotopen/node-lynx';

export const useInstallations = (filter?: Metadata) => {
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [error, setError] = useState<ErrorResponse | undefined>();

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.listInstallations(filter).then(res => {
            if (error !== undefined) setError(undefined);
            setInstallations(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, filter]);

    return {
        loading,
        error,
        installations,
        refresh,
    };
};