import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
import { EnvironmentState } from '../../../../environment/EnvironmentState'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreate extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreate, environment: EnvironmentState) {
    if (environment.renderer != null) {
        const element = environment.renderer.getAllChildRenderers()[animation.output.id].element
        element.style.opacity = `${0}`
        element.style.transform = `scale(0)`
    }
}

function onSeek(animation: TransitionCreate, environment: EnvironmentState, time: number) {
    let t = animation.ease(time / duration(animation))

    if (environment.renderer != null) {
        const element = environment.renderer.getAllChildRenderers()[animation.output.id].element
        element.style.opacity = `${t}`
        element.style.transform = `scale(${t})`
    }
}

function onEnd(animation: TransitionCreate, environment: EnvironmentState) {
    if (environment.renderer != null) {
        const element = environment.renderer.getAllChildRenderers()[animation.output.id].element
        element.style.opacity = `${1}`
        element.style.transform = `scale(${1})`
    }
}

function applyInvariant(animation: TransitionCreate, environment: EnvironmentState) {
    if (environment.renderer != null && !animation.isPlaying) {
        const element = environment.renderer.getAllChildRenderers()[animation.output.id].element
        element.style.opacity = `${0}`
        element.style.transform = `scale(0)`
    }
}

export function transitionCreate(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreate {
    return {
        ...createAnimationNode({ ...options, delay: 0 }),

        name: 'TransitionCreate',

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
