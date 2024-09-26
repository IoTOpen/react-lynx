import {useGlobalLynxClient, useGlobalUser} from '../Contexts';
import {useSimpleMQTT} from './useSimpleMQTT';

export const useMQTT = () => {
    const client = useGlobalLynxClient();
    const {user} = useGlobalUser();
    return useSimpleMQTT(client.lynxClient.baseURL, user?.email ?? 'api-key', client.lynxClient.apiKey);
};
