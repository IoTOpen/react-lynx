import {useCallback, useState} from 'react';

import type {EmptyInstallation, Metadata} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';


export interface InstallationTemplate {
    name?: string
    notes?: string
    meta?: Metadata
    protected_meta?: Metadata
}

export const useNewInstallation = (organizationId: number | string, template?: InstallationTemplate) => {
    const oid = typeof organizationId === 'string' ? Number.parseInt(organizationId) : organizationId;
    if (isNaN(oid)) {
        throw new Error('invalid organizationId');
    }
    const [newInstallation, setNewInstallation] = useState<EmptyInstallation>({
        name: '', notes: '', users: [],
        meta: {},
        protected_meta: {},
        ...template, organization_id: oid
    });
    const {lynxClient} = useGlobalLynxClient();

    const create = useCallback(() => lynxClient.createInstallation(newInstallation), [lynxClient, newInstallation]);

    return {
        newInstallation,
        setNewInstallation,
        create,
    };
};