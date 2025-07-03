import { ErrorResponse, NotificationMessage } from '@iotopen/node-lynx';
export declare const useNotificationMessage: (installationId: number | string, notificationId: number | string) => {
    refresh: () => void;
    message: NotificationMessage;
    setMessage: import("react").Dispatch<import("react").SetStateAction<NotificationMessage>>;
    error: ErrorResponse | undefined;
    loading: boolean;
    remove: () => void;
    update: () => void;
};
