import { useCallback, useEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
export const useOAuth2Clients = () => {
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [clients, setClients] = useState([]);
    const refresh = useCallback(() => {
        lynxClient.getOAuth2Clients().then(clients => {
            setError((err) => err !== undefined ? undefined : err);
            setClients(clients);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        refresh,
        clients,
        error,
        loading
    };
};
//# sourceMappingURL=useOAuth2Clients.js.map