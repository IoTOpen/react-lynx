import { ErrorResponse, NotificationMessage } from '@iotopen/node-lynx';
export declare const useNotificationMessages: (installationId: number | string) => {
    refresh: () => void;
    notificationMessages: NotificationMessage[];
    error: ErrorResponse | undefined;
    loading: boolean;
};
