import { ErrorResponse, OAuth2Client } from '@iotopen/node-lynx';
export declare const useOAuth2Client: (id: string) => {
    refresh: () => void;
    client: OAuth2Client;
    setClient: import("react").Dispatch<import("react").SetStateAction<OAuth2Client>>;
    error: ErrorResponse | undefined;
    loading: boolean;
    remove: () => Promise<import("@iotopen/node-lynx").OKResponse>;
    update: () => Promise<OAuth2Client>;
};
