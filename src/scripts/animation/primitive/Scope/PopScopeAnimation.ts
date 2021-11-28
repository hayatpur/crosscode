import { popScope } from '../../../environment/environment'
import { updateRootViewLayout } from '../../../environment/layout'
import { RootViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface PopScopeAnimation extends AnimationNode {}

function onBegin(animation: PopScopeAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    popScope(environment)

    if (options.baking) {
        computeReadAndWrites(animation)
    }

    updateRootViewLayout(view)
}

function onSeek(animation: PopScopeAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: PopScopeAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: PopScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function popScopeAnimation(options: AnimationOptions = {}): PopScopeAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'PopScopeAnimation',
        name: 'PopScopeAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
