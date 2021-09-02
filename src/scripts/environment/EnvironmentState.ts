import { stringHashCode } from '../utilities/string';
import { DataState } from './data/DataState';

export enum AccessorType {
    ID = 'ID',
    Symbol = 'Symbol',
    Index = 'Index',
    Register = 'Register',
}

export interface Accessor {
    type: AccessorType;
    value: number | string;
}

export function accessorToString(accessor: Accessor): string {
    if (accessor.type === AccessorType.Register) {
        return `${accessor.type}(0x${stringHashCode(accessor.value as string)
            .toString()
            .substring(0, 6)})`;
    }
    return `${accessor.type}(${accessor.value})`;
}

export function accessorsToString(accessors: Accessor[]): string {
    return `${accessors.map((acc) => accessorToString(acc)).join(' > ')}`;
}

export interface Scope {
    [name: string]: Accessor[];
}

export interface EnvironmentState {
    // Variable name bindings
    scope: Scope[];

    // Storage data
    memory: (DataState | null)[];

    // Temporary data
    registers: { [name: string]: DataState };

    // Unsafe temporary data (used to exchange data within an animation)
    _temps: { [name: string]: any };

    id: string;
}

export function instanceOfEnvironment(environment: any): environment is EnvironmentState {
    return 'scope' in environment && 'memory' in environment && 'registers' in environment && '_temps' in environment;
}
