import { ConcretePath, PrototypicalPath } from '../path/path'
import { EnvironmentRepresentation } from '../representation/EnvironmentRepresentation'
import { ConcreteDataState, PrototypicalDataState, Transform } from './data/DataState'

export enum AccessorType {
    ID = 'ID',
    Symbol = 'Symbol',
    Index = 'Index',
    Register = 'Register',
}

export interface Accessor {
    type: AccessorType
    value: number | string
}

export function accessorToString(accessor: Accessor): string {
    // if (accessor.type === AccessorType.Register) {
    //     return `${accessor.type}(0x${stringHashCode(accessor.value as string)
    //         .toString()
    //         .substring(0, 6)})`;
    // }
    return `${accessor.type}(${accessor.value})`
}

export function accessorsToString(accessors: Accessor[]): string {
    return `${accessors.map((acc) => accessorToString(acc)).join(' > ')}`
}

export interface PrototypicalIdentifierState {
    name: string
    location: Accessor[]
}

export interface ConcreteIdentifierState {
    prototype: PrototypicalIdentifierState
    transform: Transform
}

export interface PrototypicalScope {
    [name: string]: PrototypicalIdentifierState
}

export interface ConcreteScope {
    [name: string]: ConcreteIdentifierState
}

export interface EnvironmentTransform extends Transform {
    // Anchors to align it to lines of code, or to other views
    positionModifiers: EnvironmentPositionModifier[]
}

export interface PrototypicalEnvironmentState {
    _type: 'PrototypicalEnvironmentState'

    // Variable name bindings
    scope: PrototypicalScope[]

    // Paths
    paths: { [id: string]: PrototypicalPath }

    // Storage data
    memory: (PrototypicalDataState | null)[]

    // Temporary data
    registers: { [name: string]: PrototypicalDataState }

    // Unsafe temporary data (used to exchange data within an animation)
    _temps: { [name: string]: any }

    id: string
}

export interface ConcreteEnvironmentState {
    _type: 'ConcreteEnvironmentState'
    prototype: PrototypicalEnvironmentState

    // Variable name bindings
    scope: ConcreteScope[]

    // Concrete paths
    paths: { [id: string]: ConcretePath }

    // Storage data
    memory: (ConcreteDataState | null)[]
    transform: EnvironmentTransform

    // Representation
    representation: EnvironmentRepresentation
}

export interface EnvironmentPositionModifier {
    type: EnvironmentPositionModifierType
    value: any
}

export enum EnvironmentPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}

export function instanceOfPrototypicalEnvironment(environment: any): environment is PrototypicalEnvironmentState {
    return environment['_type'] === 'PrototypicalEnvironmentState'
}

export function instanceOfConcreteEnvironment(environment: any): environment is ConcreteEnvironmentState {
    return environment['_type'] === 'ConcreteEnvironmentState'
}
