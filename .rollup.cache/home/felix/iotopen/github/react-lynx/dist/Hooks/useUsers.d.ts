import { Metadata, User } from '@iotopen/node-lynx';
export declare const useUsers: (filter?: Metadata) => {
    users: User[];
    setUsers: import("react").Dispatch<import("react").SetStateAction<User[]>>;
    refresh: () => void;
    loading: boolean;
    error: Error | undefined;
};
