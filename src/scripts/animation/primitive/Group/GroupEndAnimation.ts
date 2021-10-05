import { clone } from '../../../utilities/objects';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface GroupEndAnimation extends AnimationNode {}

function onBegin(animation: GroupEndAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: GroupEndAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: GroupEndAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    console.log(clone(view));
}

export function groupEndAnimation(options: AnimationOptions = {}): GroupEndAnimation {
    return {
        ...createAnimationNode(null, options),

        name: 'Group End',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
