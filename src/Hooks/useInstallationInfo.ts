import {useGlobalLynxClient} from '../Contexts';
import {ErrorResponse, InstallationInfo} from '@iotopen/node-lynx';
import {useCallback, useLayoutEffect, useState} from 'react';

export const useInstallationInfo = (assignedOnly?: boolean) => {
    const {lynxClient} = useGlobalLynxClient();
    const [installations, setInstallations] = useState<InstallationInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorResponse | undefined>(undefined);

    const refreshCall = useCallback(() => {
        setLoading(true);
        lynxClient.getInstallations(assignedOnly).then((res) => {
            setError((err) => err !== undefined ? undefined : err);
            setInstallations(res);
        }).catch((e: ErrorResponse) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lynxClient]);

    useLayoutEffect(() => {
        refreshCall();
    }, [refreshCall]);

    return {
        installations: installations,
        refresh: refreshCall,
        loading: loading,
        error: error,
    };
};
