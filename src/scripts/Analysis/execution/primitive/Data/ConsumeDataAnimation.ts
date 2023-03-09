import { DataState } from '../../../../DataView/Environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../transpiler/environment'
import { Accessor, EnvironmentState } from '../../../transpiler/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type ConsumeDataAnimation = ExecutionNode & {
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
