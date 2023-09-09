import {useCallback, useState} from 'react';
import {Address, EmptyOrganization, Metadata, OrganizationChild} from '@iotopen/node-lynx';
import {useGlobalLynxClient} from '../Contexts';
import {zeroOrganization} from './useOrganization';


export type OrganizationTemplate = {
    address?: Address
    children?: OrganizationChild[]
    email?: string
    force_sms_login?: boolean
    phone?: string
    name?: string
    notes?: string
    password_valid_days?: number
    meta?: Metadata
    protected_meta?: Metadata
}
export const zeroEmptyOrganization = {
    address: {
        address: '',
        city: '',
        country: '',
        zip: '',
    },
    children: [],
    email: '',
    force_sms_login: false,
    meta: {},
    name: '',
    notes: '',
    parent: 0,
    password_valid_days: 0,
    phone: '',
    protected_meta: {},
};
export const useNewOrganization = (parentId: number | string , template?: OrganizationTemplate) => {
    const pid = typeof parentId === 'string' ? Number.parseInt(parentId) : parentId;
    if (isNaN(pid)) {
        throw new Error('invalid parentId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [newOrganization, setNewOrganization] = useState<EmptyOrganization>({
        ...zeroEmptyOrganization,
        ...template, parent: pid
    });

    const create = useCallback(() => {
        return lynxClient.createOrganization(newOrganization);
    }, [lynxClient, newOrganization]);

    return {
        newOrganization,
        setNewOrganization,
        create,
    };
};