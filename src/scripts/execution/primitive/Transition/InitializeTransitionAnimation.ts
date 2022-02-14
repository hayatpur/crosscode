import { AnimationNode, AnimationOptions, createAnimationNode } from '../../../animation/animation'
import { replaceEnvironmentWith } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'

export interface InitializeTransitionAnimation extends AnimationNode {
    transitionCondition: PrototypicalEnvironmentState
}

function onBegin(
    animation: InitializeTransitionAnimation,
    environment: PrototypicalEnvironmentState
) {
    replaceEnvironmentWith(environment, animation.transitionCondition)
}

function onSeek(
    animation: InitializeTransitionAnimation,
    environment: PrototypicalEnvironmentState,
    time: number
) {}

function onEnd(
    animation: InitializeTransitionAnimation,
    environment: PrototypicalEnvironmentState
) {}

export function initializeTransitionAnimation(
    transitionCondition: PrototypicalEnvironmentState,
    options: AnimationOptions = {}
): InitializeTransitionAnimation {
    return {
        ...createAnimationNode({ ...options, duration: 1, delay: 0 }),
        name: 'InitializeTransitionAnimation',
        transitionCondition,

        onBegin,
        onSeek,
        onEnd,
    }
}
