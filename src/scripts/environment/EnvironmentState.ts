import { stringHashCode } from '../utilities/string';
import { DataState, Transform } from './data/DataState';

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
    // if (accessor.type === AccessorType.Register) {
    //     return `${accessor.type}(0x${stringHashCode(accessor.value as string)
    //         .toString()
    //         .substring(0, 6)})`;
    // }
    return `${accessor.type}(${accessor.value})`;
}

export function accessorsToString(accessors: Accessor[]): string {
    return `${accessors.map((acc) => accessorToString(acc)).join(' > ')}`;
}

export interface IdentifierState {
    name: string;
    location: Accessor[];
    transform: Transform;
}

export interface Scope {
    [name: string]: IdentifierState;
}

export interface EnvironmentTransform extends Transform {
    // Anchors to align it to lines of code, or to other views
    positionModifiers: EnvironmentPositionModifier[];
}

export interface EnvironmentState {
    _type: 'EnvironmentState';

    transform: EnvironmentTransform;

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

export interface EnvironmentPositionModifier {
    type: EnvironmentPositionModifierType;
    value: any;
}

export enum EnvironmentPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}

export function instanceOfEnvironment(environment: any): environment is EnvironmentState {
    return environment['_type'] === 'EnvironmentState';
}
