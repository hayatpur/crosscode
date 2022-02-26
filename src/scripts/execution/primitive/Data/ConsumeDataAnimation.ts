import { DataState } from '../../../environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface ConsumeDataAnimation extends ExecutionNode {
    register: Accessor[]
}

function apply(animation: ConsumeDataAnimation, environment: EnvironmentState) {
    // Get data
    const data = resolvePath(environment, animation.register, `${animation.id}_Property`, null, {
        noResolvingReference: true,
    }) as DataState

    const dataLocation = getMemoryLocation(environment, data).foundLocation

    // Consume data
    removeAt(environment, dataLocation)

    computeReadAndWrites(animation, {
        location: dataLocation,
        id: data.id,
    })
}

function computeReadAndWrites(animation: ConsumeDataAnimation, data: DataInfo) {
    animation._reads = []
    animation._writes = [data]
}

export function consumeDataAnimation(register: Accessor[]): ConsumeDataAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'ConsumeDataAnimation',

        name: 'ConsumeDataAnimation',

        // Attributes
        register,

        // Callbacks
        apply,
    }
}
