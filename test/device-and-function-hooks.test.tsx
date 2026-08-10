import type { ReactNode } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getDevice: vi.fn(),
    getDevices: vi.fn(),
    getFunction: vi.fn(),
    getFunctions: vi.fn(),
    createDeviceMeta: vi.fn(),
    updateDeviceMeta: vi.fn(),
    deleteDeviceMeta: vi.fn(),
    createFunctionMeta: vi.fn(),
    updateFunctionMeta: vi.fn(),
    deleteFunctionMeta: vi.fn(),
}));

vi.mock('@iotopen/node-lynx', () => {
    class LynxClient {
        getDevice = mocks.getDevice;
        getDevices = mocks.getDevices;
        getFunction = mocks.getFunction;
        getFunctions = mocks.getFunctions;
        createDeviceMeta = mocks.createDeviceMeta;
        updateDeviceMeta = mocks.updateDeviceMeta;
        deleteDeviceMeta = mocks.deleteDeviceMeta;
        createFunctionMeta = mocks.createFunctionMeta;
        updateFunctionMeta = mocks.updateFunctionMeta;
        deleteFunctionMeta = mocks.deleteFunctionMeta;
    }

    return { LynxClient };
});

import { LynxClientProvider, useGlobalLynxClient } from '../src/Contexts/LynxClientProvider';
import { useDevice, useDeviceMeta } from '../src/Hooks/useDevice';
import { useDevices } from '../src/Hooks/useDevices';
import { useFunction, useFunctionMeta } from '../src/Hooks/useFunction';
import { useFunctions } from '../src/Hooks/useFunctions';

const device = (id: number) => ({
    id,
    installation_id: 1,
    type: `device-${id}`,
    updated: 0,
    created: 0,
    meta: {},
    protected_meta: {},
});

const func = (id: number) => ({
    id,
    installation_id: 1,
    type: `function-${id}`,
    updated: 0,
    created: 0,
    meta: {},
    protected_meta: {},
});

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(promiseResolve => {
        resolve = promiseResolve;
    });
    return { promise, resolve };
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <LynxClientProvider url="https://api.example" apiKey="token">
        {children}
    </LynxClientProvider>
);

describe('device and function hooks', () => {
    beforeEach(() => {
        Object.values(mocks).forEach(mock => mock.mockReset());
        mocks.getDevice.mockResolvedValue(device(1));
        mocks.getDevices.mockResolvedValue([]);
        mocks.getFunction.mockResolvedValue(func(1));
        mocks.getFunctions.mockResolvedValue([]);
        mocks.createDeviceMeta.mockResolvedValue({});
        mocks.createFunctionMeta.mockResolvedValue({});
    });

    it('preserves master resource ID coercion', async () => {
        renderHook(() => useDevice('1junk', '1.5'), { wrapper });
        renderHook(() => useDevices(0), { wrapper });
        renderHook(() => useFunction(-1, Number.POSITIVE_INFINITY), { wrapper });
        renderHook(() => useFunctions('0x10'), { wrapper });

        await waitFor(() => {
            expect(mocks.getDevice).toHaveBeenCalledWith(1, 1);
            expect(mocks.getDevices).toHaveBeenCalledWith(0, undefined);
            expect(mocks.getFunction).toHaveBeenCalledWith(-1, Number.POSITIVE_INFINITY);
            expect(mocks.getFunctions).toHaveBeenCalledWith(16, undefined);
        });
    });

    it('still rejects resource IDs that master treated as NaN', () => {
        expect(() => renderHook(() => useDevice('invalid', 1), { wrapper })).toThrow('invalid installationId');
    });

    it('preserves the metadata device ID fallback', () => {
        const { result } = renderHook(() => useDeviceMeta(1), { wrapper });

        void result.current.createMeta('key', {});
        expect(mocks.createDeviceMeta).toHaveBeenCalledWith(1, 0, 'key', {}, undefined);
    });

    it('preserves the metadata function ID fallback', () => {
        const { result } = renderHook(() => useFunctionMeta(1), { wrapper });

        void result.current.createMeta('key', {});
        expect(mocks.createFunctionMeta).toHaveBeenCalledWith(1, 0, 'key', {}, undefined);
    });

    it('ignores a device response from a replaced client', async () => {
        const first = deferred<ReturnType<typeof device>>();
        const second = deferred<ReturnType<typeof device>>();
        mocks.getDevice
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        const { result } = renderHook(() => {
            const { newLynxClient } = useGlobalLynxClient();
            return { ...useDevice(1, 1), newLynxClient };
        }, { wrapper });

        await waitFor(() => expect(mocks.getDevice).toHaveBeenCalledOnce());

        act(() => result.current.newLynxClient('https://api.example', 'new-token'));
        await waitFor(() => expect(mocks.getDevice).toHaveBeenCalledTimes(2));

        await act(async () => second.resolve(device(2)));
        await waitFor(() => expect(result.current.Device.id).toBe(2));

        await act(async () => first.resolve(device(1)));
        expect(result.current.Device.id).toBe(2);
    });

    it('clears function data while a different function loads', async () => {
        const second = deferred<ReturnType<typeof func>>();
        mocks.getFunction
            .mockResolvedValueOnce(func(1))
            .mockReturnValueOnce(second.promise);

        const { result, rerender } = renderHook(
            ({ functionId }) => useFunction(1, functionId),
            { initialProps: { functionId: 1 }, wrapper },
        );

        await waitFor(() => expect(result.current.Function.id).toBe(1));
        rerender({ functionId: 2 });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
            expect(result.current.Function.id).toBe(0);
        });

        await act(async () => second.resolve(func(2)));
        await waitFor(() => expect(result.current.Function.id).toBe(2));
    });

    it('keeps the latest device refresh result', async () => {
        const firstRefresh = deferred<ReturnType<typeof device>[]>();
        const secondRefresh = deferred<ReturnType<typeof device>[]>();
        mocks.getDevices
            .mockResolvedValueOnce([device(1)])
            .mockReturnValueOnce(firstRefresh.promise)
            .mockReturnValueOnce(secondRefresh.promise);

        const { result } = renderHook(() => useDevices(1), { wrapper });
        await waitFor(() => expect(result.current.devices[0]?.id).toBe(1));

        act(() => result.current.refresh());
        await waitFor(() => expect(mocks.getDevices).toHaveBeenCalledTimes(2));
        act(() => result.current.refresh());
        await waitFor(() => expect(mocks.getDevices).toHaveBeenCalledTimes(3));

        await act(async () => secondRefresh.resolve([device(3)]));
        await waitFor(() => expect(result.current.devices[0]?.id).toBe(3));

        await act(async () => firstRefresh.resolve([device(2)]));
        expect(result.current.devices[0]?.id).toBe(3);
    });

    it('keeps the latest function refresh result', async () => {
        const firstRefresh = deferred<ReturnType<typeof func>[]>();
        const secondRefresh = deferred<ReturnType<typeof func>[]>();
        mocks.getFunctions
            .mockResolvedValueOnce([func(1)])
            .mockReturnValueOnce(firstRefresh.promise)
            .mockReturnValueOnce(secondRefresh.promise);

        const { result } = renderHook(() => useFunctions(1), { wrapper });
        await waitFor(() => expect(result.current.functions[0]?.id).toBe(1));

        act(() => result.current.refresh());
        await waitFor(() => expect(mocks.getFunctions).toHaveBeenCalledTimes(2));
        act(() => result.current.refresh());
        await waitFor(() => expect(mocks.getFunctions).toHaveBeenCalledTimes(3));

        await act(async () => secondRefresh.resolve([func(3)]));
        await waitFor(() => expect(result.current.functions[0]?.id).toBe(3));

        await act(async () => firstRefresh.resolve([func(2)]));
        expect(result.current.functions[0]?.id).toBe(3);
    });
});
