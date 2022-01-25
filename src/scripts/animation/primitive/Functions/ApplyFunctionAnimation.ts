import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface ApplyFunctionAnimation extends AnimationNode {
    func: Function
    object: Accessor[]
    args: Accessor[][]
}

function onBegin(
    animation: ApplyFunctionAnimation,
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
}

function onSeek(
    animation: ApplyFunctionAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: ApplyFunctionAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: ApplyFunctionAnimation,
    data: AnimationData
) {
    animation._reads = [data]
    animation._writes = []
}

export function applyFunctionAnimation(
    func: Function,
    object: Accessor[],
    args: Accessor[][],
    options: AnimationOptions = {}
): ApplyFunctionAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'ApplyFunctionAnimation',

        name: 'Return Statement',
        func,
        object,
        args,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
