import { PrototypicalDataState } from '../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { Accessor, PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface FloatAnimation extends ExecutionNode {
    dataSpecifier: Accessor[]
}

function apply(animation: FloatAnimation, environment: PrototypicalEnvironmentState) {
    const data = resolvePath(environment, animation.dataSpecifier, null) as PrototypicalDataState

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
