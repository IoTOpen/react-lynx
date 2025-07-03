import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
const zeroNotificationOutput = {
    id: 0,
    installation_id: 0,
    name: '',
    notification_message_id: 0,
    notification_output_executor_id: 0,
    config: {},
};
// This type guard checks if the caught error is a valid ErrorResponse.
// This is necessary because catch block errors are of type `unknown`.
const isErrorResponse = (e) => {
    return (typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        'status' in e);
};
export const useNotificationOutput = (installationId, notificationId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof notificationId === 'string' ? Number.parseInt(notificationId) : notificationId;
    if (isNaN(iid)) {
        throw new Error('invalid installationId');
    }
    if (isNaN(id)) {
        throw new Error('invalid notificationId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState({
        ...zeroNotificationOutput,
        config: { ...zeroNotificationOutput.config }
    });
    const [error, setError] = useState();
    const refresh = useCallback(() => {
        if (iid === 0 || id === 0)
            return;
        setLoading(true);
        lynxClient.getNotificationOutput(iid, id).then(res => {
            setError((err) => err !== undefined ? undefined : err);
            setOutput(res);
        }).catch(e => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ message: 'An unexpected error occurred', status: 500 });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id, iid, lynxClient]);
    const update = useCallback(() => {
        if (error !== undefined)
            setError(undefined);
        lynxClient.updateNotificationOutput(output).then(res => {
            setOutput(res);
        }).catch(e => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ message: 'An unexpected error occurred', status: 500 });
            }
        });
    }, [error, lynxClient, output]);
    const remove = useCallback(() => {
        lynxClient.deleteNotificationOutput(output).then(() => {
            setOutput({ ...zeroNotificationOutput });
        }).catch(e => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ message: 'An unexpected error occurred', status: 500 });
            }
        });
    }, [lynxClient, output]);
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        refresh,
        output,
        setOutput,
        error,
        loading,
        remove,
        update
    };
};
//# sourceMappingURL=useNotificationOutput.js.map