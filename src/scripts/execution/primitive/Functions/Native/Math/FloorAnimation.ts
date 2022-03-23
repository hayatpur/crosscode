import { cloneData, createPrimitiveData, replaceDataWith } from '../../../../../environment/data'
import { addDataAt, getMemoryLocation, resolvePath } from '../../../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../../../environment/EnvironmentState'
import { DataState, DataType } from '../../../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../../../ExecutionNode'

export interface FloorAnimation extends ExecutionNode {
    argument: Accessor[]
    outputRegister: Accessor[]
}

function apply(animation: FloorAnimation, environment: EnvironmentState) {
    const arg = resolvePath(environment, animation.argument, `${animation.id}_Data`) as DataState
    const copy = cloneData(arg, false, `${animation.id}_Arg`)
    const location = addDataAt(environment, copy, [], null)
    copy.value = Math.floor(arg.value as number)

    // Put it in the floating stack
    const register = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as DataState
    replaceDataWith(register, createPrimitiveData(DataType.ID, copy.id, `${animation.id}_Floating`))

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, arg).foundLocation,
            id: arg.id,
        },
        {
            location: location,
            id: copy.id,
        }
    )
}

function computeReadAndWrites(animation: FloorAnimation, argument: DataInfo, data: DataInfo) {
    animation._reads = [argument]
    animation._writes = [data]
}

export function FloorAnimation(
    object: Accessor[],
    args: Accessor[][],
    outputRegister: Accessor[]
): FloorAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'FloorAnimation',

        name: 'FloorAnimation',
        argument: args[0],
        outputRegister: outputRegister,

        // Callbacks
        apply,
    }
}
