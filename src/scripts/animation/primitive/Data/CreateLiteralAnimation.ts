import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataTransform, DataType } from '../../../environment/data/DataState';
import { addDataAt, removeAt, resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
import { updateRootViewLayout } from '../../../environment/layout';
import { getRelativeLocation, remap, Vector } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp;
    locationHint: Accessor[];
    outputRegister: Accessor[];
}

/**
 * Puts data into context.output register.
 * @param animation
 * @param view
 * @param options
 */
function onBegin(animation: CreateLiteralAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    let referenceTransform: DataTransform;

    updateRootViewLayout(view);

    const data = createData(DataType.Literal, animation.value as number | string | boolean, `${animation.id}_Create`);
    data.transform.styles.position = 'absolute';

    // Add the newly created data to environment
    const loc = addDataAt(environment, data, [], null);
    environment._temps[`CreateLiteralAnimation${animation.id}`] = loc;
    updateRootViewLayout(view);

    if (animation.locationHint.length > 0) {
        // Get the output data
        referenceTransform = (resolvePath(environment, animation.locationHint, `${animation.id}_Location`) as DataState)
            .transform;
    } else {
        // Then it doesn't have a place yet
        // Find an empty space and put it there
        const placeholder = createData(DataType.Literal, '', `${animation.id}_Placeholder`);
        placeholder.transform.styles.position = 'relative';
        const placeholderLocation = addDataAt(environment, placeholder, [], `${animation.id}_PlaceholderLiteral`);
        updateRootViewLayout(view);

        updateRootViewLayout(view);
        referenceTransform = { ...placeholder.transform };
        removeAt(environment, placeholderLocation);
    }

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: environment._temps[`CreateLiteralAnimation${this.id}`],
            id: data.id,
        });
    }

    // Get the relative location w.r.t environment
    let location: Vector = getRelativeLocation(referenceTransform.rendered, environment.transform.rendered);

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: environment._temps[`CreateLiteralAnimation${this.id}`],
            id: data.id,
        });
    }

    data.transform.styles.left = `${location.x}px`;
    data.transform.styles.top = `${location.y}px`;

    data.transform.styles.elevation = 3;

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState;
    replaceDataWith(outputRegister, createData(DataType.ID, data.id, `${animation.id}_OutputRegister`));

    updateRootViewLayout(view);
}

function onSeek(animation: CreateLiteralAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(
        environment,
        environment._temps[`CreateLiteralAnimation${animation.id}`],
        null
    ) as DataState;

    data.transform.styles.elevation = remap(t, 0, 1, 3, 1);
}

function onEnd(animation: CreateLiteralAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);
    delete environment._temps[`CreateLiteralAnimation${animation.id}`];
}

export function computeReadAndWrites(animation: CreateLiteralAnimation, data: AnimationData) {
    animation._reads = [];
    animation._writes = [data];
}

export function createLiteralAnimation(
    value: string | number | bigint | boolean | RegExp,
    outputRegister: Accessor[],
    locationHint: Accessor[],
    options: AnimationOptions = {}
): CreateLiteralAnimation {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 30,

        name: `Create Literal ${value} at ${accessorsToString(outputRegister)}`,

        // Attributes
        value,
        outputRegister,
        locationHint,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
