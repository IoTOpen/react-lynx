import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {ErrorResponse, NotificationOutputExecutor} from '@iotopen/node-lynx';


const zeroExecutor = {
    id: 0,
    type: '',
    name: '',
    organization_id: 0,
    config: {},
    secret: ''
};

export const useNotificationOutputExecutor = (installationId: number | string, executorId: number | string) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof executorId === 'string' ? Number.parseInt(executorId) : executorId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    if (isNaN(id)) {
        throw new Error('invalid messageId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [outputExecutor, setOutputExecutor] = useState<NotificationOutputExecutor>({
        ...zeroExecutor,
    });
    const [error, setError] = useState<ErrorResponse | undefined>();
    const refresh = useCallback(() => {
        if(iid === 0 || id === 0) return;
        setLoading(true);
        lynxClient.getNotificationOutputExecutor(iid, id).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setOutputExecutor(res);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [id, iid, lynxClient]);

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        refresh,
        outputExecutor,
        setOutputExecutor,
        error,
        loading,
    };
};