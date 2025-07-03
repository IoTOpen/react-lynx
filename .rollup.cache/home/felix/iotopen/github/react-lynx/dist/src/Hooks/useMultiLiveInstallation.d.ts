import { Devicex, Functionx, Installation } from '@iotopen/node-lynx';
import { SimpleMQTT } from './useSimpleMQTT';
export interface MultiLiveInstallation {
    installationMap: Map<number, Installation>;
    functionMap: Map<number, Functionx[]>;
    deviceMap: Map<number, Devicex[]>;
    mqtt: SimpleMQTT;
    toClientId: (iid: number) => number;
    toInstallationId: (cid: number) => number;
}
export declare const useMultiLiveInstallation: (installations: Installation[]) => MultiLiveInstallation;
