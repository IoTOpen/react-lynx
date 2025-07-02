import { EmptyToken, ErrorResponse, Token } from '@iotopen/node-lynx';
export declare const useTokens: () => {
    tokens: Token[];
    remove: (token: Token) => Promise<import("@iotopen/node-lynx").OKResponse>;
    create: (token: EmptyToken) => Promise<Token>;
    refresh: () => void;
    loading: boolean;
    error: ErrorResponse | undefined;
};
