import { replaceEnvironmentWith } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface BeginTransitionAnimation extends AnimationNode {
    transitionCondition: EnvironmentState
}

function onBegin(animation: BeginTransitionAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    replaceEnvironmentWith(getCurrentEnvironment(view), animation.transitionCondition)

    updateRootViewLayout(view)
    updateRootViewLayout(view)
}

function onSeek(animation: BeginTransitionAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: BeginTransitionAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function beginTransitionAnimation(
    transitionCondition: EnvironmentState,
    options: AnimationOptions = {}
): BeginTransitionAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'BeginTransitionAnimation',

        name: 'BeginTransitionAnimation',

        transitionCondition,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
