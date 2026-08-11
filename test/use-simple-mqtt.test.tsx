import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  connected: true,
  onConnected: undefined as (() => void) | undefined,
  pub: vi.fn(),
  sub: vi.fn(),
  unsub: vi.fn(),
}));

vi.mock('../src/Hooks/usePahoMQTTClient', () => ({
  usePahoMQTTClient: (_uri: string, handlers?: { onConnected?: () => void }) => {
    mocks.onConnected = handlers?.onConnected;
    return {
      connected: mocks.connected,
      error: undefined,
      pub: mocks.pub,
      sub: mocks.sub,
      unsub: mocks.unsub,
    };
  },
}));

import { useSimpleMQTT } from '../src/Hooks/useSimpleMQTT';

describe('useSimpleMQTT', () => {
  beforeEach(() => {
    mocks.connected = true;
    mocks.onConnected = undefined;
    mocks.pub.mockReset();
    mocks.sub.mockReset().mockResolvedValue(0);
    mocks.unsub.mockReset().mockResolvedValue(undefined);
  });

  it('skips a queued subscription update superseded before it starts', async () => {
    const { result } = renderHook(() => useSimpleMQTT('wss://example.com/mqtt'));

    act(() => {
      result.current.setSubs(['devices/first']);
      result.current.setSubs(['devices/latest']);
    });

    await waitFor(() => {
      expect(mocks.sub).toHaveBeenCalledTimes(1);
    });
    expect(mocks.sub).toHaveBeenCalledWith('devices/latest');
  });

  it('removes an in-flight stale subscription before applying the latest update', async () => {
    let resolveFirstSubscription!: (qos: 0) => void;
    mocks.sub.mockImplementationOnce(() => new Promise<0>((resolve) => {
      resolveFirstSubscription = resolve;
    }));
    const { result } = renderHook(() => useSimpleMQTT('wss://example.com/mqtt'));

    act(() => {
      result.current.setSubs(['devices/first']);
    });
    await waitFor(() => {
      expect(mocks.sub).toHaveBeenCalledWith('devices/first');
    });

    act(() => {
      result.current.setSubs(['devices/latest']);
      resolveFirstSubscription(0);
    });

    await waitFor(() => {
      expect(mocks.sub).toHaveBeenCalledWith('devices/latest');
    });
    expect(mocks.unsub).toHaveBeenCalledWith('devices/first');
    expect(mocks.sub).toHaveBeenCalledTimes(2);
  });

  it('restores only the latest requested subscriptions after reconnecting', async () => {
    mocks.connected = false;
    const { result } = renderHook(() => useSimpleMQTT('wss://example.com/mqtt'));

    await act(async () => {
      result.current.setSubs(['devices/first']);
      result.current.setSubs(['devices/latest']);
    });
    expect(mocks.sub).not.toHaveBeenCalled();

    act(() => {
      mocks.onConnected?.();
    });

    await waitFor(() => {
      expect(mocks.sub).toHaveBeenCalledWith('devices/latest');
    });
    expect(mocks.sub).toHaveBeenCalledTimes(1);
  });
});
