import { EmptyNotificationOutput } from '@iotopen/node-lynx';
export type NotificationOutputTemplate = {
    installation_id?: number;
    name?: string;
    notification_message_id?: number;
    notification_output_executor_id?: number;
    config?: {
        [key: string]: string;
    };
};
export declare const useNewNotificationOutput: (installationId: number | string, template?: NotificationOutputTemplate) => {
    newNotificationOutput: EmptyNotificationOutput;
    setNewNotificationOutput: import("react").Dispatch<import("react").SetStateAction<EmptyNotificationOutput>>;
    create: () => Promise<import("@iotopen/node-lynx").NotificationOutput>;
};
