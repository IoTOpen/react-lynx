import { useCallback, useLayoutEffect, useState } from 'react';
import { useGlobalLynxClient } from '../Contexts';
import { isErrorResponse } from '../utils/errorHandling';
const zeroFunction = {
    id: 0,
    installation_id: 0,
    type: '',
    updated: 0,
    created: 0,
    meta: {},
    protected_meta: {}
};
export const useFunction = (installationId, functionId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const id = typeof functionId === 'string' ? Number.parseInt(functionId) : functionId;
    if (isNaN(iid) || isNaN(id)) {
        throw new Error('invalid installationId or functionId');
    }
    const { lynxClient } = useGlobalLynxClient();
    const [loading, setLoading] = useState(true);
    const [func, setFunc] = useState({ ...zeroFunction });
    const [error, setError] = useState();
    useLayoutEffect(() => {
        lynxClient.getFunction(iid, id).then(fn => {
            // Reset error only if there was a previous error
            setError(undefined);
            setFunc(fn);
        }).catch((e) => {
            if (isErrorResponse(e)) {
                setError(e);
            }
            else {
                setError({ status: 500, message: 'Unknown error' });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [lynxClient, iid, id]);
    const update = useCallback(async () => {
        if (!func) {
            throw new Error('update on undefined function');
        }
        return lynxClient.updateFunction(func);
    }, [lynxClient, func]);
    const setType = useCallback((t) => {
        if (func)
            setFunc({ ...func, type: t });
    }, [func, setFunc]);
    const remove = useCallback(async () => {
        if (!func) {
            throw new Error('delete on undefined function');
        }
        return lynxClient.deleteFunction(func);
    }, [func, lynxClient]);
    return {
        loading: loading,
        error: error,
        Function: func,
        setFunction: setFunc,
        update: update,
        remove: remove,
        setType: setType,
    };
};
export const useFunctionMeta = (installationId, functionId) => {
    const iid = typeof installationId === 'string' ? Number.parseInt(installationId) : installationId;
    const fnId = typeof functionId === 'string' ? Number.parseInt(functionId) : functionId;
    const { lynxClient } = useGlobalLynxClient();
    const create = useCallback((key, meta, funId, silent) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.createFunctionMeta(iid, id, key, meta, silent);
    }, [lynxClient, iid, fnId]);
    const update = useCallback((key, meta, createMissing, funId, silent) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.updateFunctionMeta(iid, id, key, meta, silent, createMissing);
    }, [lynxClient, iid, fnId]);
    const remove = useCallback((key, funId, silent) => {
        const id = funId ?? fnId ?? 0;
        return lynxClient.deleteFunctionMeta(iid, id, key, silent);
    }, [lynxClient, iid, fnId]);
    return {
        createMeta: create,
        updateMeta: update,
        removeMeta: remove,
    };
};
//# sourceMappingURL=useFunction.js.map