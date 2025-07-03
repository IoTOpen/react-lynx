import { zero } from '@iotopen/node-lynx';
import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useOAuth2Client = (id) => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [client, setClient] = useState({ ...zero.getOAuth2Client() });
    const refresh = useCallback(() => {
        if (!loading)
            setLoading(true);
        lynxClient.getOAuth2Client(id).then(client => {
            setError((err) => err !== undefined ? undefined : err);
            setClient(client);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [loading, lynxClient, id]);
    useEffect(() => {
        refresh();
    }, [id]);
    const remove = useCallback(() => {
        return lynxClient.deleteOAuth2Client(client);
    }, [client, lynxClient]);
    const update = useCallback(() => {
        return lynxClient.updateOAuth2Client(client);
    }, [client, lynxClient]);
    return {
        refresh,
        client,
        setClient,
        error,
        loading,
        remove,
        update,
    };
};
//# sourceMappingURL=useOAuth2Client.js.map