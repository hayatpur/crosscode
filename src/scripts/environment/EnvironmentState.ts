import { PrototypicalPath } from '../path/path'
import { ScopeType } from '../transpiler/Statements/BlockStatement'
import { stringHashCode } from '../utilities/string'
import { PrototypicalDataState, Transform } from './data/DataState'

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
    if (accessor.type === AccessorType.Register) {
        return `${accessor.type}(0x${stringHashCode(accessor.value as string)
            .toString()
            .substring(0, 4)})`
    }
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
    bindings: { [name: string]: PrototypicalIdentifierState }
    type: ScopeType
}

export interface ConcreteScope {
    bindings: { [name: string]: ConcreteIdentifierState }
    type: ScopeType
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

export interface EnvironmentPositionModifier {
    type: EnvironmentPositionModifierType
    value: any
}

export enum EnvironmentPositionModifierType {
    NextToCode = 'NextToCode',
    AboveView = 'AboveView',
    BelowView = 'BelowView',
}

export function instanceOfPrototypicalEnvironment(
    environment: any
): environment is PrototypicalEnvironmentState {
    return environment['_type'] === 'PrototypicalEnvironmentState'
}
