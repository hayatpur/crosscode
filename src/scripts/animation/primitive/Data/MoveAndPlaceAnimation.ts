import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataTransform, DataType, instanceOfData } from '../../../environment/data/DataState';
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
    updateEnvironmentLayout,
} from '../../../environment/environment';
import { Accessor, accessorsToString, instanceOfEnvironment } from '../../../environment/EnvironmentState';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { remap } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface MoveAndPlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];
    noMove: boolean;
}

function onBegin(animation: MoveAndPlaceAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    const move = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;
    const to = resolvePath(environment, animation.outputSpecifier, `${animation.id}_to`);

    updateEnvironmentLayout(environment);

    let endTransform: DataTransform;

    if (instanceOfEnvironment(to)) {
        // Then it doesn't have a place yet
        const placeholder = createData(DataType.ID, '_MoveAnimationPlaceholder', `${animation.id}_Placeholder`);
        const placeholderLocation = addDataAt(environment, placeholder, [], `${animation.id}_Placeholder`);

        updateEnvironmentLayout(environment);
        endTransform = { ...placeholder.transform };

        removeAt(environment, placeholderLocation);
    } else {
        endTransform = { ...to.transform };
    }

    // Start position
    const start_transform = { ...move.transform };

    // Create a movement path to translate the floating container along
    const path = new DataMovementPath(start_transform, endTransform);
    path.seek(0);

    environment._temps[`MovePath${animation.id}`] = path;
}

function onSeek(animation: MoveAndPlaceAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    let move = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;

    // Move
    if (time <= 80 && !animation.noMove) {
        let t = animation.ease(remap(time, 0, 80, 0, 1));

        const path = environment._temps[`MovePath${animation.id}`];
        path.seek(t);

        const position = path.getPosition(t);
        move.transform.x = position.x;
        move.transform.y = position.y;
    }
    // Place
    else {
        let t = animation.ease(remap(time, 80, 100, 0, 1));
        if (animation.noMove) {
            t = animation.ease(remap(time, 0, 20, 0, 1));
        }
        move.transform.z = 1 - t;
    }
}

function onEnd(animation: MoveAndPlaceAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    environment._temps[`MovePath${this.id}`]?.destroy();
    delete environment._temps[`MovePath${this.id}`];

    const input = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;
    const to = resolvePath(environment, animation.outputSpecifier, `${animation.id}_EndTo`) as DataState;

    // if (options.baking) {
    //     this.computeReadAndWrites(
    //         {
    //             location: getMemoryLocation(environment, (input).foundLocation,
    //             id: input.id,
    //         },
    //         { location: getMemoryLocation(environment, (to).foundLocation, id: to.id }
    //     );
    // }

    removeAt(environment, getMemoryLocation(environment, input).foundLocation);

    if (instanceOfData(to)) {
        replaceDataWith(to, input, { frame: true, id: true });
    }

    // console.log('Removing...');

    input.transform.floating = false;
    input.transform.z = 0;
}

export function moveAndPlaceAnimation(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[],
    noMove: boolean = false,
    options: AnimationOptions = {}
): MoveAndPlaceAnimation {
    return {
        ...createAnimationNode(null, options),

        name: `Move data at ${accessorsToString(inputSpecifier)} onto ${accessorsToString(outputSpecifier)}`,

        // Attributes
        inputSpecifier,
        outputSpecifier,
        noMove,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}

// For direct movement
// if (move.transform.floating == false) {
//     const copy = new Data({ type: move.type });
//     copy.replaceWith(move, { frame: true, id: true });

//     environment.addDataAt([], copy);
//     copy.transform.floating = true;
//     copy.transform.z = 0;

//     move.value = undefined;
//     move = copy;

//     animation.inputSpecifier = [{type: AccessorType.ID, value: move.id}];
// }
