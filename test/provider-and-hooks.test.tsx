import { useEffect } from 'react';

import { render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  instances: [] as Array<{ baseURL: string; apiKey?: string; bearer: boolean }>,
  getInstallationRow: vi.fn(),
  updateInstallation: vi.fn(),
  deleteInstallation: vi.fn(),
  getUser: vi.fn(),
  getUsers: vi.fn(),
  getMe: vi.fn(),
  getPermissions: vi.fn(),
  getNotificationOutput: vi.fn(),
  updateNotificationOutput: vi.fn(),
  deleteNotificationOutput: vi.fn(),
}));

vi.mock('@iotopen/node-lynx', () => {
  class LynxClient {
    baseURL: string;
    apiKey?: string;
    bearer: boolean;

    getInstallationRow = mocks.getInstallationRow;
    updateInstallation = mocks.updateInstallation;
    deleteInstallation = mocks.deleteInstallation;
    getUser = mocks.getUser;
    getUsers = mocks.getUsers;
    getMe = mocks.getMe;
    getPermissions = mocks.getPermissions;
    getNotificationOutput = mocks.getNotificationOutput;
    updateNotificationOutput = mocks.updateNotificationOutput;
    deleteNotificationOutput = mocks.deleteNotificationOutput;

    constructor(baseURL = '', apiKey?: string, bearer = false) {
      this.baseURL = baseURL;
      this.apiKey = apiKey;
      this.bearer = bearer;
      mocks.instances.push(this);
    }
  }

  return { LynxClient };
});

import { LynxClientProvider, useGlobalLynxClient } from '../src/Contexts/LynxClientProvider';
import { UserProvider, useGlobalUser } from '../src/Contexts/UserProvider';
import { useInstallation } from '../src/Hooks/useInstallation';
import { useNotificationOutput } from '../src/Hooks/useNotificationOutput';
import { useUser } from '../src/Hooks/useUser';

describe('LynxProvider and hooks', () => {
  beforeEach(() => {
    mocks.instances.length = 0;
    mocks.getInstallationRow.mockReset();
    mocks.updateInstallation.mockReset();
    mocks.deleteInstallation.mockReset();
    mocks.getUser.mockReset();
    mocks.getUsers.mockReset();
    mocks.getMe.mockReset();
    mocks.getPermissions.mockReset();
    mocks.getNotificationOutput.mockReset();
    mocks.updateNotificationOutput.mockReset();
    mocks.deleteNotificationOutput.mockReset();
  });

  it('rebuilds the client when provider props change', async () => {
    const seenClients: Array<{ baseURL: string; apiKey?: string; bearer: boolean }> = [];

    function CaptureClient() {
      const { lynxClient } = useGlobalLynxClient();

      useEffect(() => {
        seenClients.push(lynxClient);
      }, [lynxClient]);

      return null;
    }

    function Harness({ apiURL, apiKey, bearer = false }: { apiURL: string; apiKey?: string; bearer?: boolean }) {
      return (
        <LynxClientProvider url={apiURL} apiKey={apiKey} bearer={bearer}>
          <CaptureClient />
        </LynxClientProvider>
      );
    }

    const { rerender } = render(<Harness apiURL="https://first.example" apiKey="alpha" />);

    expect(mocks.instances).toHaveLength(1);

    await waitFor(() => {
      expect(seenClients[0]).toMatchObject({ baseURL: 'https://first.example', apiKey: 'alpha', bearer: false });
    });

    const firstClient = seenClients[0];

    rerender(<Harness apiURL="https://second.example" apiKey="beta" bearer />);

    await waitFor(() => {
      expect(seenClients[seenClients.length - 1]).toMatchObject({ baseURL: 'https://second.example', apiKey: 'beta', bearer: true });
    });

    expect(seenClients[seenClients.length - 1]).not.toBe(firstClient);
    expect(mocks.instances).toHaveLength(2);
  });

  it('loads the current user and permissions', async () => {
    mocks.getMe.mockResolvedValue({ id: 1, email: 'user@example.com' });
    mocks.getPermissions.mockResolvedValue({ installations_read: true });

    const { result } = renderHook(() => useGlobalUser(), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example" apiKey="token">
          <UserProvider>{children}</UserProvider>
        </LynxClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toMatchObject({ id: 1, email: 'user@example.com' });
    expect(result.current.permissions).toEqual({ installations_read: true });
    expect(mocks.getMe).toHaveBeenCalledOnce();
    expect(mocks.getPermissions).toHaveBeenCalledOnce();
  });

  it('does not load identity data without an API key', () => {
    const { result } = renderHook(() => useGlobalUser(), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example">
          <UserProvider>{children}</UserProvider>
        </LynxClientProvider>
      ),
    });

    expect(result.current).toMatchObject({ user: null, permissions: null, loading: false });
    expect(mocks.getMe).not.toHaveBeenCalled();
    expect(mocks.getPermissions).not.toHaveBeenCalled();
  });

  it('clears identity data when loading fails', async () => {
    const error = { status: 401, message: 'Unauthorized' };
    mocks.getMe.mockRejectedValue(error);
    mocks.getPermissions.mockResolvedValue({ installations_read: true });

    const { result } = renderHook(() => useGlobalUser(), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example" apiKey="token">
          <UserProvider>{children}</UserProvider>
        </LynxClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.permissions).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it('ignores responses from a replaced client', async () => {
    let resolveFirstUser!: (user: unknown) => void;
    let resolveFirstPermissions!: (permissions: unknown) => void;
    const firstUser = new Promise(resolve => { resolveFirstUser = resolve; });
    const firstPermissions = new Promise(resolve => { resolveFirstPermissions = resolve; });
    mocks.getMe
      .mockImplementationOnce(() => firstUser)
      .mockResolvedValueOnce({ id: 2, email: 'second@example.com' });
    mocks.getPermissions
      .mockImplementationOnce(() => firstPermissions)
      .mockResolvedValueOnce({ installations_read: false });

    let latestUser: unknown;
    function CaptureUser() {
      latestUser = useGlobalUser().user;
      return null;
    }

    function Harness({ apiKey }: { apiKey: string }) {
      return (
        <LynxClientProvider url="https://api.example" apiKey={apiKey}>
          <UserProvider>
            <CaptureUser />
          </UserProvider>
        </LynxClientProvider>
      );
    }

    const { rerender } = render(<Harness apiKey="first-token" />);

    await waitFor(() => {
      expect(mocks.getMe).toHaveBeenCalledOnce();
      expect(mocks.getPermissions).toHaveBeenCalledOnce();
    });

    rerender(<Harness apiKey="second-token" />);

    await waitFor(() => {
      expect(latestUser).toMatchObject({ id: 2, email: 'second@example.com' });
    });

    resolveFirstUser({ id: 1, email: 'first@example.com' });
    resolveFirstPermissions({ installations_read: true });

    await Promise.resolve();
    expect(latestUser).toMatchObject({ id: 2, email: 'second@example.com' });
  });

  it('resolves installation update and delete operations', async () => {
    mocks.getInstallationRow.mockResolvedValue({
      id: 7,
      client_id: 77,
      created: 1,
      name: 'Office',
      organization_id: 3,
      notes: 'demo',
      users: [],
      meta: {},
      protected_meta: {},
    });
    mocks.updateInstallation.mockResolvedValue({
      id: 7,
      client_id: 77,
      created: 1,
      name: 'Office',
      organization_id: 3,
      notes: 'demo',
      users: [],
      meta: {},
      protected_meta: {},
    });
    mocks.deleteInstallation.mockResolvedValue({ message: 'Deleted' });

    const { result } = renderHook(() => useInstallation(7), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example" apiKey="token">
          {children}
        </LynxClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.update()).resolves.toMatchObject({ id: 7, name: 'Office' });
    await expect(result.current.remove()).resolves.toMatchObject({ message: 'Deleted' });
  });

  it('loads user data on mount', async () => {
    mocks.getUser.mockResolvedValue({
      id: 1,
      address: { address: 'A', city: 'B', country: 'C', zip: 'D' },
      assigned_installations: [],
      email: 'user@example.com',
      expire_at: 0,
      first_name: 'Test',
      last_name: 'User',
      mobile: '',
      note: '',
      organisations: [],
      password: '',
      role: 1,
      sms_login: false,
      protected_meta: {},
      meta: {},
    });

    const { result } = renderHook(() => useUser(1), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example" apiKey="token">
          {children}
        </LynxClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mocks.getUser).toHaveBeenCalledWith(1);
    expect(result.current.user.email).toBe('user@example.com');
  });

  it('returns promises from notification output mutations', async () => {
    mocks.getNotificationOutput.mockResolvedValue({
      id: 9,
      installation_id: 1,
      name: 'Email',
      notification_message_id: 3,
      notification_output_executor_id: 4,
      config: {},
    });
    mocks.updateNotificationOutput.mockResolvedValue({
      id: 9,
      installation_id: 1,
      name: 'Pager',
      notification_message_id: 3,
      notification_output_executor_id: 4,
      config: {},
    });
    mocks.deleteNotificationOutput.mockResolvedValue({ message: 'Deleted' });
    mocks.getUser.mockResolvedValue({
      id: 1,
      address: { address: 'A', city: 'B', country: 'C', zip: 'D' },
      assigned_installations: [],
      email: 'user@example.com',
      expire_at: 0,
      first_name: 'Test',
      last_name: 'User',
      mobile: '',
      note: '',
      organisations: [],
      password: '',
      role: 1,
      sms_login: false,
      protected_meta: {},
      meta: {},
    });

    const { result } = renderHook(() => useNotificationOutput(1, 9), {
      wrapper: ({ children }) => (
        <LynxClientProvider url="https://api.example" apiKey="token">
          {children}
        </LynxClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.update()).resolves.toMatchObject({ name: 'Pager' });
    await expect(result.current.remove()).resolves.toMatchObject({ message: 'Deleted' });
  });
});
