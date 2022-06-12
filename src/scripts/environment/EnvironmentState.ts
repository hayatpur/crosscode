import { DataState, Transform } from '../renderer/View/Environment/data/DataState'
import { ScopeType } from '../transpiler/Statements/BlockStatement'
import { stringHashCode } from '../utilities/string'

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

export interface EnvironmentTransform extends Transform {}

export interface Residual {
    data: DataState
    location: Accessor[]
}

export interface EnvironmentState {
    _type: 'EnvironmentState'

    // Variable name bindings
    scope: Scope[]

    // Storage data
    memory: { [id: string]: DataState }

    // Temporary data
    registers: { [name: string]: DataState }

    // Residual data (indexed with time)
    residuals: Residual[][]

    // ID map of timestamp of each data
    timestamps: { [id: string]: number }

    id: string
}

export function instanceOfEnvironment(environment: any): environment is EnvironmentState {
    return environment['_type'] === 'EnvironmentState'
}
