import { useCallback, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
const zeroEmptyNotificationOutput = {
    installation_id: 0,
    name: '',
    notification_message_id: 0,
    notification_output_executor_id: 0,
    config: {},
};
export const useNewNotificationOutput = (installationId, template) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const { lynxClient } = useGlobalLynxClient();
    const [newNotificationOutput, setNewNotificationOutput] = useState({
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
//# sourceMappingURL=useNewNotificationOutput.js.map