import { ErrorResponse, NotificationOutputExecutor } from '@iotopen/node-lynx';
export declare const useNotificationOutputExecutor: (installationId: number | string, executorId: number | string) => {
    refresh: () => void;
    outputExecutor: NotificationOutputExecutor;
    setOutputExecutor: import("react").Dispatch<import("react").SetStateAction<NotificationOutputExecutor>>;
    error: ErrorResponse | undefined;
    loading: boolean;
};
