import { EmptyNotificationMessage } from '@iotopen/node-lynx';
export type NotificationMessageTemplate = {
    installation_id?: number;
    name?: string;
    text?: string;
};
export declare const useNewNotificationMessage: (installationId: number | string, template?: NotificationMessageTemplate) => {
    newNotificationMessage: EmptyNotificationMessage;
    setNewNotificationMessage: import("react").Dispatch<import("react").SetStateAction<EmptyNotificationMessage>>;
    create: () => Promise<import("@iotopen/node-lynx").NotificationMessage>;
};
