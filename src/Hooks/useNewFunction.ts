import {useCallback, useState} from 'react';

import type {EmptyFunctionx, Metadata} from '@iotopen/node-lynx';

import {useGlobalLynxClient} from '../Contexts';

export interface FunctionTemplate {
    type?: string
    meta?: Metadata
    protected_meta?: Metadata
}

export const useNewFunction = (installationId: number | string, template?: FunctionTemplate) => {
    const id = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    if (isNaN(id)) {
        throw new Error('invalid installationId');
    }
    const {lynxClient} = useGlobalLynxClient();
    const [newFunction, setNewFunction] = useState<EmptyFunctionx>({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: id
    });

    const setType = useCallback((t: string) => {
        setNewFunction({...newFunction, type: t});
    }, [newFunction, setNewFunction]);

    const create = useCallback(() => lynxClient.createFunction(newFunction), [lynxClient, newFunction]);

    return {
        newFunction,
        setNewFunction,
        create,
        setType,
    };
};
