import { DataState } from '../../../../DataView/Environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../transpiler/environment'
import { Accessor, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type FloatAnimation = ExecutionNode & {
    dataSpecifier: Accessor[]
}

function apply(animation: FloatAnimation, environment: EnvironmentState) {
    const data = resolvePath(environment, animation.dataSpecifier, null) as DataState

    computeReadAndWrites(animation, {
        location: getMemoryLocation(environment, data).foundLocation,
        id: data.id,
    })
}

function computeReadAndWrites(animation: FloatAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = []
}

export function floatAnimation(dataSpecifier: Accessor[]): FloatAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'FloatAnimation',

        name: 'FloatAnimation',

        // Attributes
        dataSpecifier,

        // Callbacks
        apply,
    }
}
