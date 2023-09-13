import {useGlobalLynxClient} from '../Contexts';
import {EmptyNotificationMessage} from '@iotopen/node-lynx';
import {useCallback, useState} from 'react';


const zeroEmptyNotificationMessage = {
    installation_id: 0,
    name: '',
    text: '',
};

export type NotificationMessageTemplate = {
    installation_id?: number;
    name?: string;
    text?: string;
}

export const useNewNotificationMessage = (installationId: number | string, template?: NotificationMessageTemplate) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const {lynxClient} = useGlobalLynxClient();
    const [newNotificationMessage, setNewNotificationMessage] = useState<EmptyNotificationMessage>({
        ...zeroEmptyNotificationMessage,
        ...template,
        installation_id: iid,
    });

    const create = useCallback(() => {
        return lynxClient.createNotificationMessage(newNotificationMessage);
    }, [lynxClient, newNotificationMessage]);

    return {
        newNotificationMessage,
        setNewNotificationMessage,
        create
    };
};