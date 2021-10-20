import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface FloatAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
}

function onBegin(animation: FloatAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    // if (options.baking) {
    //     const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
    //     this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id }));
    // }
}

function onSeek(animation: FloatAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(environment, animation.dataSpecifier, null) as DataState;
    data.transform.styles.elevation = t;
}

function onEnd(animation: FloatAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function floatAnimation(dataSpecifier: Accessor[], options: AnimationOptions = {}): FloatAnimation {
    return {
        ...createAnimationNode(null, options),

        name: 'FloatAnimation',

        // Attributes
        dataSpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
