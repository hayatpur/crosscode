import { clone } from '../../../utilities/objects';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface GroupEndAnimation extends AnimationNode {}

function onBegin(animation: GroupEndAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    if (options.baking) {
        computeReadAndWrites(animation);
    }

    console.log('Ending group', clone(getCurrentEnvironment(view)));
}

function onSeek(
    animation: GroupEndAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: GroupEndAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: GroupEndAnimation) {
    animation._reads = [];
    animation._writes = [];
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
