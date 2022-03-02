import { AnimationNode, AnimationOptions, createAnimationNode } from '../../../animation/animation'
import { AnimationRendererRepresentation } from '../../../environment/AnimationRenderer'
import { replaceEnvironmentWith } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { clone } from '../../../utilities/objects'

export interface InitializeTransitionAnimation extends AnimationNode {
    transitionCondition: EnvironmentState
    representation: AnimationRendererRepresentation
}

function onBegin(animation: InitializeTransitionAnimation, environment: EnvironmentState) {
    replaceEnvironmentWith(environment, animation.transitionCondition)
    environment.renderer?.setState(environment, animation.representation)
    console.log('Initializing transition...', animation.id, clone(environment))
}

function onSeek(
    animation: InitializeTransitionAnimation,
    environment: EnvironmentState,
    time: number
) {}

function onEnd(animation: InitializeTransitionAnimation, environment: EnvironmentState) {}

export function initializeTransitionAnimation(
    transitionCondition: EnvironmentState,
    representation: AnimationRendererRepresentation,
    options: AnimationOptions = {}
): InitializeTransitionAnimation {
    return {
        ...createAnimationNode({ ...options, duration: 1, delay: 0 }),
        name: 'InitializeTransitionAnimation',
        transitionCondition,
        representation,

        onBegin,
        onSeek,
        onEnd,
    }
}
