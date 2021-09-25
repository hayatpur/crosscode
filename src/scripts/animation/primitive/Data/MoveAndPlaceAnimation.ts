import { createData, replaceDataWith } from '../../../environment/data/data';
import {
    DataState,
    DataTransform,
    DataType,
    instanceOfData,
    PositionType,
} from '../../../environment/data/DataState';
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment';
import {
    Accessor,
    accessorsToString,
    instanceOfEnvironment,
} from '../../../environment/EnvironmentState';
import { updateEnvironmentLayout } from '../../../environment/layout';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { remap } from '../../../utilities/math';
import { clone } from '../../../utilities/objects';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface MoveAndPlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];
    noMove: boolean;
}

function onBegin(
    animation: MoveAndPlaceAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);

    const move = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;

    const to = resolvePath(environment, animation.outputSpecifier, `${animation.id}_to`);

    updateEnvironmentLayout(environment);

    // Start position
    const startTransform = { ...move.transform };

    let endTransform: DataTransform;

    if (animation.outputSpecifier.length == 0) {
        console.log('Finding new');
        // Then it doesn't have a place yet
        // Find an empty space and put it there
        const placeholder = createData(DataType.Literal, '', `${animation.id}_Placeholder`);
        placeholder.transform.z = 1;
        placeholder.transform.positionType = PositionType.Relative;

        const placeholderLocation = addDataAt(
            environment,
            placeholder,
            [],
            `${animation.id}_Placeholder`
        );

        console.log(clone(getCurrentEnvironment(view)));

        updateEnvironmentLayout(environment);
        endTransform = { ...placeholder.transform };

        removeAt(environment, placeholderLocation);
    } else {
        endTransform = { ...(to as DataState).transform };
    }

    // if (startTransform.x == endTransform.x && startTransform.y == endTransform.y) {
    //     animation.noMove = true;
    // }

    // Create a movement path to translate the floating container along
    const path = new DataMovementPath(startTransform, endTransform);
    path.seek(0);

    environment._temps[`MovePath${animation.id}`] = path;
}

function onSeek(
    animation: MoveAndPlaceAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);
    let move = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;

    const tn = time / duration(animation);

    // Move
    if (tn <= 0.7) {
        let t = animation.ease(remap(tn, 0, 0.7, 0, 1));

        const path = environment._temps[`MovePath${animation.id}`] as DataMovementPath;
        path.seek(t);

        const position = path.getPosition(t);
        move.transform.x = position.x;
        move.transform.y = position.y;
    }
    // Place
    else if (tn >= 0.8) {
        let t: number;

        if (animation.noMove) {
            t = animation.ease(tn);
        } else {
            t = animation.ease(remap(tn, 0.8, 1, 0, 1));
        }

        move.transform.z = 1 - t;
    }

    updateEnvironmentLayout(environment);
}

function onEnd(
    animation: MoveAndPlaceAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);
    environment._temps[`MovePath${this.id}`]?.destroy();
    delete environment._temps[`MovePath${this.id}`];

    const input = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState;
    const to = resolvePath(
        environment,
        animation.outputSpecifier,
        `${animation.id}_EndTo`
    ) as DataState;

    // if (options.baking) {
    //     this.computeReadAndWrites(
    //         {
    //             location: getMemoryLocation(environment, (input).foundLocation,
    //             id: input.id,
    //         },
    //         { location: getMemoryLocation(environment, (to).foundLocation, id: to.id }
    //     );
    // }

    if (instanceOfEnvironment(to)) {
    } else {
        removeAt(environment, getMemoryLocation(environment, input).foundLocation);

        if (instanceOfData(to)) {
            replaceDataWith(to, input, { frame: true });
        }
    }

    input.transform.z = 0;
    input.transform.positionType = PositionType.Relative;

    updateEnvironmentLayout(environment);
}

export function moveAndPlaceAnimation(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[],
    noMove: boolean = false,
    options: AnimationOptions = {}
): MoveAndPlaceAnimation {
    return {
        ...createAnimationNode(null, { ...options, duration: noMove ? 30 : 60 }),

        name: `Move data at ${accessorsToString(inputSpecifier)} onto ${accessorsToString(
            outputSpecifier
        )}`,

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
