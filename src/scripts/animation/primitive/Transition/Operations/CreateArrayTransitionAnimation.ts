import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import { RootViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreateArray extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateArray, view: RootViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: TransitionCreateArray, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = `scale(${t})`
}

function onEnd(animation: TransitionCreateArray, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = 'scale(1)'
    delete data.transform.renderOnlyStyles.transform
}

function applyInvariant(animation: TransitionCreateArray, view: RootViewState) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = 'scale(0)'
}

export function transitionCreateArray(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreateArray {
    return {
        ...createAnimationNode(null, { ...options }),

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
