import {useCallback, useState} from 'react';
import {EmptyNotificationOutput} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

const zeroEmptyNotificationOutput = {
    installation_id: 0,
    name: '',
    notification_message_id: 0,
    notification_output_executor_id: 0,
    config: {},
};

export type NotificationOutputTemplate = {
    installation_id?: number;
    name?: string;
    notification_message_id?: number;
    notification_output_executor_id?: number;
    config?: { [key: string]: string };
}

export const useNewNotificationOutput = (installationId: number | string, template?: NotificationOutputTemplate) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const {lynxClient} = useGlobalLynxClient();
    const [newNotificationOutput, setNewNotificationOutput] = useState<EmptyNotificationOutput>({
        ...zeroEmptyNotificationOutput,
        ...template,
        installation_id: iid,
    });

    const create = useCallback(() => {
        return lynxClient.createNotificationOutput(newNotificationOutput);
    }, [lynxClient, newNotificationOutput]);


    return {
        newNotificationOutput,
        setNewNotificationOutput,
        create,
    };
};