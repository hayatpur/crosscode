import { popScope } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface PopScopeAnimation extends AnimationNode {}

function onBegin(
    animation: PopScopeAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    popScope(environment)

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(
    animation: PopScopeAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: PopScopeAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(animation: PopScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function popScopeAnimation(
    options: AnimationOptions = {}
): PopScopeAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'PopScopeAnimation',
        name: 'PopScopeAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
