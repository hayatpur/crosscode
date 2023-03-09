import * as ESTree from 'estree'
import { DataState } from '../../../../DataView/Environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../transpiler/environment'
import { Accessor, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type UpdateAnimation = ExecutionNode & {
    dataSpecifier: Accessor[]
    operator: ESTree.UpdateOperator
}

function apply(animation: UpdateAnimation, environment: EnvironmentState) {
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState

    switch (animation.operator) {
        case '++':
            data.value = (data.value as number) + 1
            break
        case '--':
            data.value = (data.value as number) - 1
            break
        default:
            console.warn('Unrecognized update operator', animation.operator)
    }

    computeReadAndWrites(animation, {
        id: data.id,
        location: getMemoryLocation(environment, data).foundLocation,
    })
}

function computeReadAndWrites(animation: UpdateAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = [data]
}

export function updateAnimation(dataSpecifier: Accessor[], operator: ESTree.UpdateOperator): UpdateAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'UpdateAnimation',

        name: 'UpdateAnimation',

        // Attributes
        dataSpecifier,
        operator,

        // Callbacks
        apply,
    }
}
