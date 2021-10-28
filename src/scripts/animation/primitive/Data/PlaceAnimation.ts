import { replaceDataWith } from '../../../environment/data/data';
import { DataState } from '../../../environment/data/DataState';
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment';
import { Accessor, instanceOfEnvironment } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface PlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];
}

function onBegin(animation: PlaceAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    // if (options.baking) {
    //     const data = resolvePath(environment, this.dataSpecifier, null) as DataState;
    //     this.computeReadAndWrites({ location: getMemoryLocation(environment, (data).foundLocation, id: data.id }));
    // }
}

function onSeek(animation: PlaceAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(environment, animation.inputSpecifier, null) as DataState;

    data.transform.styles.elevation = 1 - t;
}

function onEnd(animation: PlaceAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    const from = resolvePath(environment, animation.inputSpecifier, null) as DataState;
    let to: DataState;

    if (animation.outputSpecifier != null) {
        to = resolvePath(environment, animation.outputSpecifier, null) as DataState;

        if (instanceOfEnvironment(to)) {
            removeAt(environment, getMemoryLocation(environment, from).foundLocation);
        } else {
            // Remove the copy
            removeAt(environment, getMemoryLocation(environment, from).foundLocation);
            replaceDataWith(to, from, { frame: true, id: true });
        }
    }

    if (options.baking) {
        computeReadAndWrites(
            animation,
            { location: getMemoryLocation(environment, from).foundLocation, id: from.id },
            animation.outputSpecifier != null
                ? { location: getMemoryLocation(environment, to).foundLocation, id: to.id }
                : null
        );
    }
}

function computeReadAndWrites(animation: PlaceAnimation, inputData: AnimationData, outputData: AnimationData) {
    animation._reads = [inputData];
    animation._writes = [outputData];
}

export function placeAnimation(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[] = null,
    options: AnimationOptions = {}
): PlaceAnimation {
    return {
        ...createAnimationNode(null, options),

        name: 'Place Animation',

        // Attributes
        inputSpecifier,
        outputSpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
