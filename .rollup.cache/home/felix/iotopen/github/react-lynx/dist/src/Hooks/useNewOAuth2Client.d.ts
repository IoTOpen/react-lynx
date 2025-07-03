import { EmptyOAuth2Client } from '@iotopen/node-lynx';
export type OAuth2ClientTemplate = {
    name?: string;
    trusted?: boolean;
    allowed_scopes?: string[];
    icon_uri?: string;
    tos_uri?: string;
    policy_uri?: string;
    redirect_uris?: string[];
    id_token_alg?: string;
};
export declare const useNewOAuth2Client: (template?: OAuth2ClientTemplate) => {
    newClient: EmptyOAuth2Client;
    create: () => Promise<import("@iotopen/node-lynx").OAuth2Client>;
    setName: (name: string) => void;
    setScope: (scopes: string[]) => void;
    setIconURI: (uri: string) => void;
    setTosURI: (uri: string) => void;
    setPolicyURI: (uri: string) => void;
    setRedirectURIs: (uris: string[]) => void;
    setClient: import("react").Dispatch<import("react").SetStateAction<EmptyOAuth2Client>>;
};
