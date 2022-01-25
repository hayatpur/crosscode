import { clonePrototypicalData } from '../../../../../environment/data/data'
import { PrototypicalDataState } from '../../../../../environment/data/DataState'
import {
    getMemoryLocation,
    resolvePath,
} from '../../../../../environment/environment'
import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../../../../environment/EnvironmentState'
import { clone } from '../../../../../utilities/objects'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../../../AnimationNode'

export interface ArrayPushAnimation extends AnimationNode {
    object: Accessor[]
    args: Accessor[][]
}

function onBegin(
    animation: ArrayPushAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const object = resolvePath(
        environment,
        animation.object,
        `${animation.id}_Data`
    ) as PrototypicalDataState

    const args = animation.args.map(
        (arg) =>
            resolvePath(
                environment,
                arg,
                `${animation.id}_Data`
            ) as PrototypicalDataState
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

    console.log(clone(objectValue))

    if (options.baking) {
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
}

function onSeek(
    animation: ArrayPushAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: ArrayPushAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: ArrayPushAnimation,
    object: AnimationData,
    args: AnimationData[]
) {
    animation._reads = [...args]
    animation._writes = [object]
}

export function ArrayPushAnimation(
    object: Accessor[],
    args: Accessor[][],
    options: AnimationOptions = {}
): ArrayPushAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'ArrayPushAnimation',

        name: 'Array Push Animation',
        object,
        args,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
