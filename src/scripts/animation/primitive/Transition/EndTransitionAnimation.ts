import { ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface EndTransitionAnimation extends AnimationNode {}

function onBegin(animation: EndTransitionAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: EndTransitionAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: EndTransitionAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function endTransitionAnimation(options: AnimationOptions = {}): EndTransitionAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'EndTransitionAnimation',

        name: 'EndTransitionAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
