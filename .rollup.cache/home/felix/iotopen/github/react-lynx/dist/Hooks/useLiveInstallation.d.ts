import { Devicex, Functionx, Installation } from '@iotopen/node-lynx';
import { SimpleMQTT } from './useSimpleMQTT';
export interface LiveInstallation {
    installation: Installation;
    functions: Functionx[];
    devices: Devicex[];
    mqtt: SimpleMQTT;
}
export declare const useLiveInstallation: (installation: Installation) => LiveInstallation;
export declare const useLiveInstallationId: (installationId: number | string) => LiveInstallation;
