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
    let username = user?.email ?? 'api-key';
    if (client.lynxClient.bearer) {
        username = 'bearer';
    }
    return useSimpleMQTT(wsURL, username, client.lynxClient.apiKey);
};
