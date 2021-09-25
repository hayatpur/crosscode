import { popScope } from '../../../environment/environment';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface PopScopeAnimation extends AnimationNode {}

function onBegin(animation: PopScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    popScope(environment);
}

function onSeek(
    animation: PopScopeAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: PopScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function popScopeAnimation(options: AnimationOptions = {}): PopScopeAnimation {
    return {
        ...createAnimationNode(null, options),
        name: 'PopScopeAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
