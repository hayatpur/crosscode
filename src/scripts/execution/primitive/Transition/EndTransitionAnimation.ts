import { AnimationNode, AnimationOptions, createAnimationNode } from '../../../animation/animation'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'

export interface EndTransitionAnimation extends AnimationNode {}

function onBegin(animation: EndTransitionAnimation, environment: PrototypicalEnvironmentState) {}

function onSeek(
    animation: EndTransitionAnimation,
    environment: PrototypicalEnvironmentState,
    time: number
) {}

function onEnd(animation: EndTransitionAnimation, environment: PrototypicalEnvironmentState) {}

export function endTransitionAnimation(options: AnimationOptions = {}): EndTransitionAnimation {
    return {
        ...createAnimationNode(),
        name: 'EndTransitionAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
