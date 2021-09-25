import { createData } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import {
    addDataAt,
    declareVariable,
    getMemoryLocation,
    resolvePath,
} from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface BindAnimation extends AnimationNode {
    identifier: string;
    existingMemorySpecifier: Accessor[];
}

function onBegin(animation: BindAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    let data = null;
    let location = null;

    // Create a reference for variable
    const reference = createData(DataType.Reference, [], `${animation.id}_Reference`);
    const loc = addDataAt(environment, reference, [], `${animation.id}_Add`);

    if (animation.existingMemorySpecifier != null) {
        data = resolvePath(
            environment,
            animation.existingMemorySpecifier,
            `${animation.id}_Existing`
        ) as DataState;
        location = getMemoryLocation(environment, data).foundLocation;
    } else {
        data = createData(DataType.Literal, undefined, `${animation.id}_BindNew`);
        location = addDataAt(environment, data, [], null);
    }

    reference.value = location;

    declareVariable(environment, animation.identifier, loc);

    // if (options.baking) {
    //     animation.computeReadAndWrites({ location, id: data.id });
    // }
}

function onSeek(
    animation: BindAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: BindAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

export function bindAnimation(
    identifier: string,
    existingMemorySpecifier: Accessor[] = null,
    options: AnimationOptions = {}
): BindAnimation {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 5,
        name: `Bind Variable (${identifier}), with data at ${accessorsToString(
            existingMemorySpecifier ?? []
        )}`,

        // Attributes
        identifier,
        existingMemorySpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
