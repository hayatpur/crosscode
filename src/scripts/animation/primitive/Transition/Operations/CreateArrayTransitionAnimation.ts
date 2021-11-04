import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import { getCurrentEnvironment } from '../../../../view/view'
import { ViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreateArray extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateArray, view: ViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: TransitionCreateArray, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = getCurrentEnvironment(view)
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = `scale(${t})`
}

function onEnd(animation: TransitionCreateArray, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = 'scale(1)'
    delete data.transform.renderOnlyStyles.transform
}

function applyInvariant(animation: TransitionCreateArray, view: ViewState) {
    const environment = getCurrentEnvironment(view)
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
