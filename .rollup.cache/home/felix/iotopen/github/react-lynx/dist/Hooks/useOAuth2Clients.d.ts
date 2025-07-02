import { ErrorResponse, OAuth2Client } from '@iotopen/node-lynx';
export declare const useOAuth2Clients: () => {
    refresh: () => void;
    clients: OAuth2Client[];
    error: ErrorResponse | undefined;
    loading: boolean;
};
