import { replaceEnvironmentWith } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface InitializeTransitionAnimation extends AnimationNode {
    transitionCondition: PrototypicalEnvironmentState
}

function onBegin(
    animation: InitializeTransitionAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    replaceEnvironmentWith(view, animation.transitionCondition)
}

function onSeek(
    animation: InitializeTransitionAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: InitializeTransitionAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

export function initializeTransitionAnimation(
    transitionCondition: PrototypicalEnvironmentState,
    options: AnimationOptions = {}
): InitializeTransitionAnimation {
    return {
        ...createAnimationNode(null, { ...options, duration: 1, delay: 0 }),
        _name: 'InitializeTransitionAnimation',

        name: 'Transition',

        transitionCondition,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
