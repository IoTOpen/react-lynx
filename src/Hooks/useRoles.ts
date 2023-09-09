import {useGlobalLynxClient} from '../Contexts';
import {useCallback, useEffect, useState} from 'react';
import {Role} from '@iotopen/node-lynx';

export const useRoles = () => {
    const {lynxClient} = useGlobalLynxClient();
    const [roles, setRoles] = useState<Role[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setLoading(true);
        lynxClient.getRoles().then((roles) => {
            setRoles(roles);
        }).catch((e) => {
            setError(e);
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient]);

    useEffect(() => {
        refresh();
        /* eslint-disable react-hooks/exhaustive-deps */
    }, []);

    return {
        loading,
        error,
        roles,
        refresh
    };
};