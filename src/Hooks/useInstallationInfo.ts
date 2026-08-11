import { useCallback, useEffect, useState } from 'react';

import type { ErrorResponse, InstallationInfo } from '@iotopen/node-lynx';

import { useGlobalLynxClient } from '../Contexts';

export const useInstallationInfo = (assignedOnly?: boolean) => {
    const { lynxClient } = useGlobalLynxClient();
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
    }, [assignedOnly, lynxClient]);

    useEffect(() => {
        queueMicrotask(refreshCall);
    }, [refreshCall]);

    return {
        installations,
        refresh: refreshCall,
        loading,
        error,
    };
};
