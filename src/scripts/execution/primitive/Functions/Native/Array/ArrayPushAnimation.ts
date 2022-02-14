import { clonePrototypicalData } from '../../../../../environment/data/data'
import { PrototypicalDataState } from '../../../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../../../environment/environment'
import { Accessor, PrototypicalEnvironmentState } from '../../../../../environment/EnvironmentState'
import { DataInfo } from '../../../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../../../ExecutionNode'

export interface ArrayPushAnimation extends ExecutionNode {
    object: Accessor[]
    args: Accessor[][]
}

function apply(animation: ArrayPushAnimation, environment: PrototypicalEnvironmentState) {
    const object = resolvePath(
        environment,
        animation.object,
        `${animation.id}_Data`
    ) as PrototypicalDataState

    const args = animation.args.map(
        (arg) => resolvePath(environment, arg, `${animation.id}_Data`) as PrototypicalDataState
    )

    const objectValue = object.value as PrototypicalDataState[]

    // TODO: Copy data
    for (let i = 0; i < args.length; i++) {
        objectValue[objectValue.length] = clonePrototypicalData(
            args[i],
            false,
            `${animation.id}_Arg${i}`
        )
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
        })
    )
}

function computeReadAndWrites(animation: ArrayPushAnimation, object: DataInfo, args: DataInfo[]) {
    animation._reads = [...args]
    animation._writes = [object]
}

export function ArrayPushAnimation(object: Accessor[], args: Accessor[][]): ArrayPushAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'ArrayPushAnimation',

        name: 'Array Push Animation',
        object,
        args,

        // Callbacks
        apply,
    }
}
