import { ScopeType } from '../transpiler/Statements/BlockStatement'
import { stringHashCode } from '../utilities/string'
import { DataState, Transform } from './data/DataState'
import { EnvironmentRenderer } from './EnvironmentRenderer'

export enum AccessorType {
    ID = 'ID',
    Symbol = 'Symbol',
    Index = 'Index',
    Register = 'Register',
}

export interface Accessor {
    type: AccessorType
    value: string
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

export interface IdentifierState {
    name: string
    location: Accessor[]
}

export interface Scope {
    bindings: { [name: string]: IdentifierState }
    type: ScopeType
}

export interface EnvironmentTransform extends Transform {
    // Anchors to align it to lines of code, or to other views
    positionModifiers: EnvironmentPositionModifier[]
}

export interface EnvironmentState {
    _type: 'EnvironmentState'

    // Variable name bindings
    scope: Scope[]

    // Storage data
    memory: { [id: string]: DataState }

    // Temporary data
    registers: { [name: string]: DataState }

    id: string

    // Optional
    renderer?: EnvironmentRenderer
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

export function instanceOfEnvironment(environment: any): environment is EnvironmentState {
    return environment['_type'] === 'EnvironmentState'
}
