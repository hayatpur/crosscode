import { AnimationOptions, createAnimationNode, duration } from '../../../../animation/animation'
import { ArrayRenderer } from '../../../../environment/data/array/ArrayRenderer'
import { EnvironmentState } from '../../../../environment/EnvironmentState'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { DataInfo } from '../../../graph/ExecutionGraph'

export interface TransitionCreateArray extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateArray, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    const children = renderer.getAllChildRenderers()
    const array = children[animation.output.id] as ArrayRenderer
    array.openingBrace.style.opacity = `${0}`
    array.closingBrace.style.opacity = `${0}`
}

function onSeek(animation: TransitionCreateArray, environment: EnvironmentState, time: number) {
    let t = animation.ease(time / duration(animation))

    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    const children = renderer.getAllChildRenderers()
    const array = children[animation.output.id] as ArrayRenderer
    array.openingBrace.style.opacity = `${t}`
    array.closingBrace.style.opacity = `${t}`
}

function onEnd(animation: TransitionCreateArray, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null) {
        return
    }

    const children = renderer.getAllChildRenderers()
    const array = children[animation.output.id] as ArrayRenderer
    array.openingBrace.style.opacity = `${1}`
    array.closingBrace.style.opacity = `${1}`
}

function applyInvariant(animation: TransitionCreateArray, environment: EnvironmentState) {
    const renderer = environment.renderer
    if (renderer == null || animation.isPlaying) {
        return
    }

    const children = renderer.getAllChildRenderers()
    const array = children[animation.output.id] as ArrayRenderer
    array.openingBrace.style.opacity = `${0}`
    array.closingBrace.style.opacity = `${0}`
}

export function transitionCreateArray(
    output: DataInfo,
    origins: DataInfo[],
    options: AnimationOptions = {}
): TransitionCreateArray {
    return {
        ...createAnimationNode({ ...options }),

        name: 'TransitionCreateArray',

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
