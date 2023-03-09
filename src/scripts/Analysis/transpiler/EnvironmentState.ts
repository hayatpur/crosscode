import { DataState, Transform } from '../../DataView/Environment/data/DataState'
import { stringHashCode } from '../../Utilities/string'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../execution/primitive/ExecutionNode'

import { ScopeType } from './Statements/BlockStatement'

export enum AccessorType {
    ID = 'ID',
    Symbol = 'Symbol',
    Index = 'Index',
    Register = 'Register',
}

export type Accessor = {
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

export type IdentifierState = {
    name: string
    location: Accessor[]
}

export type Scope = {
    bindings: { [name: string]: IdentifierState }
    type: ScopeType
}

export type EnvironmentTransform = Transform & {}

export type Residual = {
    data: DataState
    location: Accessor[]
}

export type EnvironmentState = {
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

export type FrameInfo = {
    environment: EnvironmentState
    stepId: string
    overrideExecution?: ExecutionGraph | ExecutionNode
}

export function instanceOfEnvironment(environment: any): environment is EnvironmentState {
    return environment['_type'] === 'EnvironmentState'
}
