import {EmptyUser} from '@iotopen/node-lynx';
import {useCallback, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';
import {Address} from '@iotopen/node-lynx/src/types';

const zeroEmptyUser = {
    address: {
        address: '',
        zip: '',
        city: '',
        country: ''
    },
    assigned_installations: [],
    email: '',
    expire_at: 0,
    first_name: '',
    last_name: '',
    mobile: '',
    note: '',
    organisations: [],
    password: '',
    role: 0,
    sms_login: false,
    protected_meta: {},
    meta: {},
};

export type UserTemplate = {
    email?: string
    password?: string
    first_name?: string
    last_name?: string
    role?: number
    sms_login?: boolean
    mobile?: string
    note?: string
    organisations?: number[]
    assigned_installations?: number[]
    address?: Address
    expire_at?: number
    meta?: {[key: string]: any},
    protected_meta?: {[key: string]: any}
};

export const useNewUser = (template?: UserTemplate) => {
    const [newUser, setNewUser] = useState<EmptyUser>({
        ...zeroEmptyUser,
        ...template
    });
    const {lynxClient} = useGlobalLynxClient();

    const create =  useCallback(() => {
        return lynxClient.createUser(newUser);
    }, [lynxClient, newUser]);

    return {
        newUser, setNewUser,
        create,

    };
};