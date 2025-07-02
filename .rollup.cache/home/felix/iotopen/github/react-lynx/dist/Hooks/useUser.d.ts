import { User } from '@iotopen/node-lynx';
export declare const useUser: (userId: number | string) => {
    loading: boolean;
    error: Error | undefined;
    user: User;
    setUser: import("react").Dispatch<import("react").SetStateAction<User>>;
    update: () => Promise<User>;
    refresh: () => void;
    remove: () => Promise<import("@iotopen/node-lynx").OKResponse>;
};
