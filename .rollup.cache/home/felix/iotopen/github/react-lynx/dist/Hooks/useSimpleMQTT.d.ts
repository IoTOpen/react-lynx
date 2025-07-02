import Paho, { Qos, TypedArray } from 'paho-mqtt';
export type Binding = (topic: string, payload: string, qos: Qos, retained: boolean) => void;
export type Binder = (topic: RegExp | string, binder: Binding) => void;
export type Unbinder = (binder: Binding) => void;
export type ExactBinder = (topic: string, binder: Binding) => void;
export type ExactUnbinder = (topic: string, binder: Binding) => void;
export type Publisher = (topic: string, payload: string | TypedArray, qos?: Qos, retained?: boolean) => void;
export interface SimpleMQTT {
    setSubs: (subscriptions: string[]) => void;
    error?: Paho.MQTTError;
    connected: boolean;
    bind: Binder;
    unbind: Unbinder;
    bindExact: ExactBinder;
    unbindExact: ExactUnbinder;
    pub: Publisher;
}
export declare const useSimpleMQTT: (uri?: string, username?: string, password?: string) => SimpleMQTT;
