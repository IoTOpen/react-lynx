import {EmptyUser} from '@iotopen/node-lynx';
import {useCallback, useState} from 'react';
import {useGlobalLynxClient} from '../Contexts';

export const zeroEmptyUser = {
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
export const useNewUser = () => {
    const [newUser, setNewUser] = useState<EmptyUser>({...zeroEmptyUser});
    const {lynxClient} = useGlobalLynxClient();

    const create =  useCallback(() => {
        return lynxClient.createUser(newUser);
    }, [lynxClient, newUser]);

    return {
        newUser, setNewUser,
        create,

    };
};