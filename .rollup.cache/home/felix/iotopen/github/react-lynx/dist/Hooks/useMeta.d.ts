import { MetaObject, WithMeta } from '@iotopen/node-lynx';
import { DependencyList } from 'react';
export type MetaElement = MetaObject & {
    key: string;
};
export declare const useMeta: (obj?: WithMeta, deps?: DependencyList) => {
    metaList: MetaElement[];
    compile: () => WithMeta;
    addMeta: (e?: MetaElement) => void;
    removeMeta: (idx: number) => void;
    setMeta: (idx: number, e: MetaElement) => void;
    setMetaKey: (idx: number, key: string) => void;
    setMetaValue: (idx: number, value: string) => void;
    setMetaProtected: (idx: number, value: boolean) => void;
};
