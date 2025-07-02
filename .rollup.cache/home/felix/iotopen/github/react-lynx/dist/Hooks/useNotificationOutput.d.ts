import { ErrorResponse, NotificationOutput } from '@iotopen/node-lynx';
export declare const useNotificationOutput: (installationId: number | string, notificationId: number | string) => {
    refresh: () => void;
    output: NotificationOutput;
    setOutput: import("react").Dispatch<import("react").SetStateAction<NotificationOutput>>;
    error: ErrorResponse | undefined;
    loading: boolean;
    remove: () => void;
    update: () => void;
};
