import {EmptyUser} from '@iotopen/node-lynx';
import {useCallback, useState} from 'react';
import {zeroUser} from './useUser';
import {useGlobalLynxClient} from '../Contexts';

export const useNewUser = () => {
    const [newUser, setNewUser] = useState<EmptyUser>({...zeroUser});
    const {lynxClient} = useGlobalLynxClient();

    const create =  useCallback(() => {
        return lynxClient.createUser(newUser);
    }, [lynxClient, newUser]);

    return {
        newUser, setNewUser,
        create,

    };
};