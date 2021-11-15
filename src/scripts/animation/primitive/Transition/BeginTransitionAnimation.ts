import { replaceEnvironmentWith } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { RootViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface BeginTransitionAnimation extends AnimationNode {
    transitionCondition: PrototypicalEnvironmentState
}

function onBegin(animation: BeginTransitionAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    replaceEnvironmentWith(view.environment, animation.transitionCondition)

    updateRootViewLayout(view)
    updateRootViewLayout(view)
}

function onSeek(
    animation: BeginTransitionAnimation,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: BeginTransitionAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

export function beginTransitionAnimation(
    transitionCondition: PrototypicalEnvironmentState,
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
