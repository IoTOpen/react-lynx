import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  class MockPahoClient {
    onConnected?: (reconnect: boolean, host: string) => void;
    onConnectionLost?: (error: unknown) => void;
    onMessageArrived?: (message: unknown) => void;
    onMessageDelivered?: (message: unknown) => void;

    readonly connect = vi.fn();
    readonly disconnect = vi.fn();
    readonly isConnected = vi.fn(() => false);
    readonly send = vi.fn();
    readonly subscribe = vi.fn();
    readonly unsubscribe = vi.fn();

    constructor(readonly uri: string, readonly clientId: string) {
      mocks.instances.push(this);
    }
  }

  return {
    instances: [] as MockPahoClient[],
    MockPahoClient,
  };
});

vi.mock('paho-mqtt', () => ({
  default: {
    Client: mocks.MockPahoClient,
  },
  Client: mocks.MockPahoClient,
}));

import { usePahoMQTTClient } from '../src/Hooks/usePahoMQTTClient';

describe('usePahoMQTTClient', () => {
  it('uses a stable random client id when none is provided', () => {
    const randomUUID = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
    const { rerender, unmount } = renderHook(() => usePahoMQTTClient('wss://example.com/mqtt'));

    expect(mocks.instances).toHaveLength(1);
    expect(mocks.instances[0]?.uri).toBe('wss://example.com/mqtt');
    expect(mocks.instances[0]?.clientId).toBe('paho-ws-mqtt-123e4567-e89b-12d3-a456-426614174000');
    expect(randomUUID).toHaveBeenCalledTimes(1);

    const firstClientId = mocks.instances[0]?.clientId;

    rerender();

    expect(mocks.instances).toHaveLength(1);
    expect(mocks.instances[0]?.clientId).toBe(firstClientId);

    unmount();
    expect(mocks.instances[0]?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('rejects subscription failures', async () => {
    const { result } = renderHook(() => usePahoMQTTClient('wss://example.com/mqtt'));
    const failure = new Error('subscription failed');
    const mqttClient = mocks.instances.at(-1);
    if (mqttClient === undefined) {
      throw new Error('Expected Paho client instance');
    }

    mqttClient.subscribe.mockImplementation((_topic, options) => {
      options.onFailure?.(failure);
    });

    await expect(result.current.sub('devices/example')).rejects.toThrow('subscription failed');
  });

  it('rejects unsubscription failures', async () => {
    const { result } = renderHook(() => usePahoMQTTClient('wss://example.com/mqtt'));
    const failure = new Error('unsubscription failed');
    const mqttClient = mocks.instances.at(-1);
    if (mqttClient === undefined) {
      throw new Error('Expected Paho client instance');
    }

    mqttClient.unsubscribe.mockImplementation((_topic, options) => {
      options.onFailure?.(failure);
    });

    await expect(result.current.unsub('devices/example')).rejects.toThrow('unsubscription failed');
  });

  it('respects an explicit client id', () => {
    renderHook(() => usePahoMQTTClient('wss://example.com/mqtt', undefined, undefined, 'custom-client'));

    expect(mocks.instances.at(-1)?.clientId).toBe('custom-client');
  });
});
