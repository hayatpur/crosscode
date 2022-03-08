import { cloneData } from '../../../../../environment/data'
import { getMemoryLocation, resolvePath } from '../../../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../../../environment/EnvironmentState'
import { DataState } from '../../../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../../../ExecutionNode'

export interface ArrayPushAnimation extends ExecutionNode {
    object: Accessor[]
    args: Accessor[][]
}

function apply(animation: ArrayPushAnimation, environment: EnvironmentState) {
    const object = resolvePath(environment, animation.object, `${animation.id}_Data`) as DataState

    const args = animation.args.map(
        (arg) => resolvePath(environment, arg, `${animation.id}_Data`) as DataState
    )

    const objectValue = object.value as DataState[]

    // TODO: Copy data
    let originalLength = objectValue.length
    for (let i = 0; i < args.length; i++) {
        objectValue[objectValue.length] = cloneData(args[i], false, `${animation.id}_Arg${i}`)
    }

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, object).foundLocation,
            id: object.id,
        },
        args.map((arg) => {
            return {
                location: getMemoryLocation(environment, arg).foundLocation,
                id: arg.id,
            }
        }),
        args.map((arg, i) => {
            const element = objectValue[originalLength + i]
            return {
                location: getMemoryLocation(environment, element).foundLocation,
                id: element.id,
            }
        })
    )
}

function computeReadAndWrites(
    animation: ArrayPushAnimation,
    object: DataInfo,
    args: DataInfo[],
    elements: DataInfo[]
) {
    animation._reads = [...args]
    animation._writes = [object, ...elements]
}

export function ArrayPushAnimation(object: Accessor[], args: Accessor[][]): ArrayPushAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'ArrayPushAnimation',

        name: 'ArrayPushAnimation',
        object,
        args,

        // Callbacks
        apply,
    }
}
