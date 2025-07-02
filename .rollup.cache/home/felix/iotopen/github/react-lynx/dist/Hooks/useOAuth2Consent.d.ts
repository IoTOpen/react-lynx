export declare const useOAuth2Consent: () => {
    consent: (scope: string[]) => Promise<import("@iotopen/node-lynx").ConsentAcceptResponse>;
    client: import("@iotopen/node-lynx").OAuth2Client;
    requestedScopes: string[];
};
