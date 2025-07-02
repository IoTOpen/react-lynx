import { ErrorResponse, NotificationOutputExecutor } from '@iotopen/node-lynx';
export declare const useNotificationOutputExecutors: (installationId: number | string) => {
    refresh: () => void;
    notificationExecutors: NotificationOutputExecutor[];
    error: ErrorResponse | undefined;
    loading: boolean;
};
