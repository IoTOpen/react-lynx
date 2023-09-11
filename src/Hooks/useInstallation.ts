import {useCallback, useLayoutEffect, useState} from 'react';
import {Installation} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';

const zeroInstallation = {
    client_id: 0,
    notes: '',
    organization_id: 0,
    id: 0,
    name: '',
    created: 0,
    meta: {},
    users: [],
    protected_meta: {}
};

export const useInstallation = (installationId: number | string) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if(isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [installation, setInstallation] = useState<Installation>({...zeroInstallation});

    useLayoutEffect(() => {
        lynxClient.getInstallationRow(id).then(inst => {
            if (error !== undefined) setError(undefined);
            setInstallation(inst);
        }).catch(e => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id]);

    const update = useCallback(() => {
        return new Promise<Installation>(() => {
            if (!installation) {
                throw new Error('update on undefined installation');
            }
            return lynxClient.updateInstallation(installation);
        });
    }, [lynxClient, installation]);

    const remove = useCallback(() => {
        return new Promise<Installation>(() => {
            if (!installation) {
                throw new Error('update on undefined installation');
            }
            return lynxClient.deleteInstallation(installation);
        });
    }, [lynxClient, installation]);
    return {
        installation,
        setInstallation,
        update,
        remove,
        error,
        loading,
    };
};