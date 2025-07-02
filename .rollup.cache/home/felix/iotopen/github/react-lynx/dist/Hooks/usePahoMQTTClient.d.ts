import Paho, { Qos, TypedArray } from 'paho-mqtt';
interface MQTTHandlers {
    onMessage?: Paho.OnMessageHandler;
    onDelivery?: Paho.OnMessageHandler;
    onConnected?: Paho.OnConnectHandler;
    onDisconnect?: Paho.OnConnectionLostHandler;
}
export declare const usePahoMQTTClient: (uri: string, handlers?: MQTTHandlers, connectionOptions?: Paho.ConnectionOptions, clientId?: string) => {
    client: import("react").MutableRefObject<Paho.Client>;
    connected: boolean;
    error: Paho.MQTTError | undefined;
    sub: (topic: string, qos?: Qos) => Promise<Paho.Qos>;
    pub: (topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => void;
    unsub: (topic: string) => Promise<void>;
};
export {};
