import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
import { EnvironmentState } from '../../../../environment/EnvironmentState'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreateReference extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateReference, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }
}

function onSeek(animation: TransitionCreateReference, environment: EnvironmentState, time: number) {
    let t = animation.ease(time / duration(animation))

    const renderer = environment.renderer
    if (renderer == null) {
        return
    }
}

function onEnd(animation: TransitionCreateReference, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }
}

function applyInvariant(animation: TransitionCreateReference, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null || animation.isPlaying) {
        return
    }
}

export function transitionCreateReference(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreateReference {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

        name: 'TransitionCreateReference',

        output,
        origins,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,

        // Transition
        applyInvariant,
    }
}
