import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
const zeroEmptyNotificationMessage = {
    installation_id: 0,
    name: '',
    text: '',
};
export const useNewNotificationMessage = (installationId, template) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const { lynxClient } = useGlobalLynxClient();
    const [newNotificationMessage, setNewNotificationMessage] = useState({
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
//# sourceMappingURL=useNewNotificationMessage.js.map