import {useCallback, useState} from 'react';

import type {EmptyNotificationMessage} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';


const zeroEmptyNotificationMessage = {
    installation_id: 0,
    name: '',
    text: '',
};

export interface NotificationMessageTemplate {
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

    const create = useCallback(() => lynxClient.createNotificationMessage(newNotificationMessage), [lynxClient, newNotificationMessage]);

    return {
        newNotificationMessage,
        setNewNotificationMessage,
        create
    };
};