import {useGlobalLynxClient, useGlobalUser} from '../Contexts';
import {useSimpleMQTT} from './useSimpleMQTT';

export const useMQTT = () => {
    const client = useGlobalLynxClient();
    const {user} = useGlobalUser();
    const baseURLObj = new URL(client.lynxClient.baseURL);
    const protocol = baseURLObj.protocol === 'http:' ? 'ws:' : 'wss:';
    const hostname = baseURLObj.hostname;
    const port = baseURLObj.port ? `:${baseURLObj.port}` : '';
    const wsURL = `${protocol}//${hostname}${port}/mqtt`;
    return useSimpleMQTT(wsURL, user?.email ?? 'api-key', client.lynxClient.apiKey);
};
