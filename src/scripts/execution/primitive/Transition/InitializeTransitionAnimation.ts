import { AnimationNode, AnimationOptions, createAnimationNode } from '../../../animation/animation'
import { replaceEnvironmentWith } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'

export interface InitializeTransitionAnimation extends AnimationNode {
    transitionCondition: EnvironmentState
}

function onBegin(animation: InitializeTransitionAnimation, environment: EnvironmentState) {
    replaceEnvironmentWith(environment, animation.transitionCondition)
}

function onSeek(
    animation: InitializeTransitionAnimation,
    environment: EnvironmentState,
    time: number
) {}

function onEnd(animation: InitializeTransitionAnimation, environment: EnvironmentState) {}

export function initializeTransitionAnimation(
    transitionCondition: EnvironmentState,
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
