import {EmptyFunctionx, Metadata} from '@iotopen/node-lynx';
import {useCallback, useLayoutEffect, useState} from 'react';
import {useMeta} from './useMeta';
import {useGlobalLynxClient} from '../Contexts';

export type FunctionTemplate = {
    type?: string
    meta?: Metadata
    protected_meta?: Metadata
};

export const useNewFunction = (installationId: number, template?: FunctionTemplate) => {
    const {lynxClient} = useGlobalLynxClient();
    const [newFunction, setNewFunction] = useState<EmptyFunctionx>({
        meta: {},
        protected_meta: {},
        type: '', ...template, installation_id: installationId
    });
    const {setMeta, removeMeta, compile, metaList, addMeta, setMetaKey, setMetaProtected, setMetaValue} = useMeta(newFunction, []);

    useLayoutEffect(() => {
        setNewFunction({...newFunction, ...compile()});
    }, [compile, metaList, setNewFunction]);

    const setType = useCallback((t: string) => {
        setNewFunction({...newFunction, type: t});
    }, [newFunction, setNewFunction]);

    const create = useCallback(() => {
        return lynxClient.createFunction(newFunction);
    }, [lynxClient, newFunction]);

    return {
        newFunction: newFunction,
        create: create,
        setType: setType,
        removeMeta: removeMeta,
        addMeta: addMeta,
        updateMeta: setMeta,
        metaList: metaList,
        setMetaKey: setMetaKey,
        setMetaValue: setMetaValue,
        setMetaProtected: setMetaProtected,
    };
};
