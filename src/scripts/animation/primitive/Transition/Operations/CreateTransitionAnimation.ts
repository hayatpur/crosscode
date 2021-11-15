import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import { RootViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreate extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreate, view: RootViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: TransitionCreate, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = `scale(${t})`
}

function onEnd(animation: TransitionCreate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = 'scale(1)'
    delete data.transform.renderOnlyStyles.transform
}

function applyInvariant(animation: TransitionCreate, view: RootViewState) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
    data.transform.renderOnlyStyles.transform = 'scale(0)'
}

export function transitionCreate(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreate {
    return {
        ...createAnimationNode(null, { ...options }),

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
