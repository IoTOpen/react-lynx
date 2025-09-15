import {useCallback, useLayoutEffect, useState} from 'react';

import type {Installation} from '@iotopen/node-lynx';

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

// Type guard for Error to ensure type safety in catch blocks.
const isError = (e: unknown): e is Error => (
    typeof e === 'object' &&
        e !== null &&
        'message' in e
);

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
            setError((err) => err !== undefined ? undefined : err);
            setInstallation(inst);
        }).catch((e: unknown) => {
            if (isError(e)) {
                setError(e);
            } else {
                setError(new Error('Unknown error'));
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, id]);

    const update = useCallback(async () => {
        if (!installation) {
            throw new Error('update on undefined installation');
        }
        return lynxClient.updateInstallation(installation);
    }, [lynxClient, installation]);

    const remove = useCallback(async () => {
        if (!installation) {
            throw new Error('update on undefined installation');
        }
        return lynxClient.deleteInstallation(installation);
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