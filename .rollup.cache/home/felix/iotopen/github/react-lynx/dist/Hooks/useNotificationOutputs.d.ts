import { ErrorResponse, NotificationOutput } from '@iotopen/node-lynx';
export declare const useNotificationOutputs: (installationId: number | string) => {
    refresh: () => void;
    notificationOutputs: NotificationOutput[];
    error: ErrorResponse | undefined;
    loading: boolean;
};
