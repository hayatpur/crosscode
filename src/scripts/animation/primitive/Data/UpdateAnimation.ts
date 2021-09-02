import { DataState } from '../../../environment/data/DataState';
import { resolvePath } from '../../../environment/environment';
import { Accessor } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface UpdateAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    updateStep: string;
    newValue: any;
}

function onBegin(animation: UpdateAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function onSeek(animation: UpdateAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);

    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as DataState;

    if (t <= 0.8) {
        // Show the step
        // data.transform.step = animation.updateStep;
    } else {
        // Apply the new value
        // data.transform.step = null;

        data.value = animation.newValue;
    }
}

function onEnd(animation: UpdateAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    // const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
    // if (options.baking) {
    //     this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id });
    // }
}

export function updateAnimation(
    dataSpecifier: Accessor[],
    updateStep: string,
    newValue: any,
    options: AnimationOptions = {}
): UpdateAnimation {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 30,

        name: 'UpdateAnimation',

        // Attributes
        dataSpecifier,
        updateStep,
        newValue,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
