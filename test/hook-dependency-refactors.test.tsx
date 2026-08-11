import type { ReactNode } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getNotificationMessages: vi.fn(),
    getNotificationOutputExecutors: vi.fn(),
    getNotificationOutputs: vi.fn(),
    getOAuth2Clients: vi.fn(),
    getOrganizations: vi.fn(),
    createOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
}));

vi.mock('@iotopen/node-lynx', () => {
    class LynxClient {
        getNotificationMessages = mocks.getNotificationMessages;
        getNotificationOutputExecutors = mocks.getNotificationOutputExecutors;
        getNotificationOutputs = mocks.getNotificationOutputs;
        getOAuth2Clients = mocks.getOAuth2Clients;
        getOrganizations = mocks.getOrganizations;
        createOrganization = mocks.createOrganization;
        deleteOrganization = mocks.deleteOrganization;
    }

    return { LynxClient };
});

import { LynxClientProvider, useGlobalLynxClient } from '../src/Contexts/LynxClientProvider';
import { useMeta } from '../src/Hooks/useMeta';
import { useNotificationMessages } from '../src/Hooks/useNotificationMessages';
import { useNotificationOutputExecutors } from '../src/Hooks/useNotificationOutputExecutors';
import { useNotificationOutputs } from '../src/Hooks/useNotificationOutputs';
import { useOAuth2Clients } from '../src/Hooks/useOAuth2Clients';
import { useOrganizations } from '../src/Hooks/useOrganizations';

const wrapper = ({ children }: { children: ReactNode }) => (
    <LynxClientProvider url="https://api.example" apiKey="token">
        {children}
    </LynxClientProvider>
);

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(promiseResolve => {
        resolve = promiseResolve;
    });
    return { promise, resolve };
};

describe('hook dependency refactors', () => {
    beforeEach(() => {
        Object.values(mocks).forEach(mock => mock.mockReset());
    });

    it('preserves explicit useMeta dependency refreshes', async () => {
        const obj = {
            meta: { label: 'first' },
            protected_meta: {},
        };

        const { result, rerender } = renderHook(
            ({ revision }) => useMeta(obj, [revision]),
            { initialProps: { revision: 1 } },
        );

        await waitFor(() => expect(result.current.metaList[0]?.value).toBe('first'));

        obj.meta.label = 'second';
        rerender({ revision: 2 });

        await waitFor(() => expect(result.current.metaList[0]?.value).toBe('second'));
    });

    it('ignores stale notification messages after an installation change', async () => {
        const first = deferred<Array<{ id: number }>>();
        const second = deferred<Array<{ id: number }>>();
        mocks.getNotificationMessages
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        const { result, rerender } = renderHook(
            ({ installationId }) => useNotificationMessages(installationId),
            { initialProps: { installationId: 1 }, wrapper },
        );

        await waitFor(() => expect(mocks.getNotificationMessages).toHaveBeenCalledWith(1));
        rerender({ installationId: 2 });
        await waitFor(() => {
            expect(mocks.getNotificationMessages).toHaveBeenCalledWith(2);
            expect(result.current.notificationMessages).toEqual([]);
        });

        await act(async () => second.resolve([{ id: 2 }]));
        await waitFor(() => expect(result.current.notificationMessages[0]?.id).toBe(2));

        await act(async () => first.resolve([{ id: 1 }]));
        expect(result.current.notificationMessages[0]?.id).toBe(2);
    });

    it('reloads notification executors when the installation changes', async () => {
        mocks.getNotificationOutputExecutors.mockImplementation((installationId: number) => (
            Promise.resolve([{ id: installationId }])
        ));

        const { result, rerender } = renderHook(
            ({ installationId }) => useNotificationOutputExecutors(installationId),
            { initialProps: { installationId: 1 }, wrapper },
        );

        await waitFor(() => expect(result.current.notificationExecutors[0]?.id).toBe(1));
        rerender({ installationId: 2 });
        await waitFor(() => expect(result.current.notificationExecutors[0]?.id).toBe(2));
    });

    it('reloads notification outputs when the installation changes', async () => {
        mocks.getNotificationOutputs.mockImplementation((installationId: number) => (
            Promise.resolve([{ id: installationId }])
        ));

        const { result, rerender } = renderHook(
            ({ installationId }) => useNotificationOutputs(installationId),
            { initialProps: { installationId: 1 }, wrapper },
        );

        await waitFor(() => expect(result.current.notificationOutputs[0]?.id).toBe(1));
        rerender({ installationId: 2 });
        await waitFor(() => expect(result.current.notificationOutputs[0]?.id).toBe(2));
    });

    it('ignores stale OAuth clients after client replacement', async () => {
        const first = deferred<Array<{ id: number }>>();
        const second = deferred<Array<{ id: number }>>();
        mocks.getOAuth2Clients
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        const { result } = renderHook(() => {
            const { newLynxClient } = useGlobalLynxClient();
            return { ...useOAuth2Clients(), newLynxClient };
        }, { wrapper });

        await waitFor(() => expect(mocks.getOAuth2Clients).toHaveBeenCalledOnce());
        act(() => result.current.newLynxClient('https://api.example', 'new-token'));
        await waitFor(() => {
            expect(mocks.getOAuth2Clients).toHaveBeenCalledTimes(2);
            expect(result.current.clients).toEqual([]);
        });

        await act(async () => second.resolve([{ id: 2 }]));
        await waitFor(() => expect(result.current.clients[0]?.id).toBe(2));

        await act(async () => first.resolve([{ id: 1 }]));
        expect(result.current.clients[0]?.id).toBe(2);
    });

    it('reloads organizations when the minimal option changes', async () => {
        mocks.getOrganizations.mockImplementation((minimal: boolean) => (
            Promise.resolve([{ id: minimal ? 2 : 1 }])
        ));

        const { result, rerender } = renderHook(
            ({ minimal }) => useOrganizations(minimal),
            { initialProps: { minimal: false }, wrapper },
        );

        await waitFor(() => expect(result.current.organizations[0]?.id).toBe(1));
        rerender({ minimal: true });
        await waitFor(() => expect(result.current.organizations[0]?.id).toBe(2));

        expect(mocks.getOrganizations).toHaveBeenNthCalledWith(1, false);
        expect(mocks.getOrganizations).toHaveBeenNthCalledWith(2, true);
    });
});
