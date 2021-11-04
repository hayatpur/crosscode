import { popScope } from '../../../environment/environment'
import { updateRootViewLayout } from '../../../environment/layout'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface PopScopeAnimation extends AnimationNode {}

function onBegin(animation: PopScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)
    popScope(environment)

    if (options.baking) {
        computeReadAndWrites(animation)
    }

    updateRootViewLayout(view)
    updateRootViewLayout(view)
}

function onSeek(animation: PopScopeAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: PopScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

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
