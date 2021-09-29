import { createData, replaceDataWith } from '../../../environment/data/data';
import {
    DataState,
    DataTransform,
    DataType,
    PositionType,
} from '../../../environment/data/DataState';
import { addDataAt, removeAt, resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
import { updateEnvironmentLayout } from '../../../environment/layout';
import { remap } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
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
function onBegin(
    animation: CreateLiteralAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);

    const data = createData(
        DataType.Literal,
        animation.value as number | string | boolean,
        `${animation.id}_Create`
    );
    data.transform.z = 1;
    data.transform.positionType = PositionType.Absolute;

    // Add the newly created data to environment
    const loc = addDataAt(environment, data, [], null);
    environment._temps[`CreateLiteralAnimation${animation.id}`] = loc;

    let location: DataTransform;

    updateEnvironmentLayout(environment);

    if (animation.locationHint.length > 0) {
        // Get the output data
        location = (
            resolvePath(
                environment,
                animation.locationHint,
                `${animation.id}_Location`
            ) as DataState
        ).transform;
    } else {
        // Then it doesn't have a place yet
        // Find an empty space and put it there
        const placeholder = createData(DataType.Literal, '', `${animation.id}_Placeholder`);
        placeholder.transform.z = 1;
        placeholder.transform.positionType = PositionType.Relative;
        const placeholderLocation = addDataAt(
            environment,
            placeholder,
            [],
            `${animation.id}_PlaceholderLiteral`
        );

        updateEnvironmentLayout(environment);
        location = { ...placeholder.transform };

        removeAt(environment, placeholderLocation);
    }

    if (options.baking) {
        this.computeReadAndWrites({
            location: environment._temps[`CreateLiteralAnimation${this.id}`],
            id: data.id,
        });
    }

    data.transform.x = location?.x ?? 0;
    data.transform.y = location?.y ?? 0;

    data.transform.z = 3;

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as DataState;
    replaceDataWith(
        outputRegister,
        createData(DataType.ID, data.id, `${animation.id}_OutputRegister`)
    );
}

function onSeek(
    animation: CreateLiteralAnimation,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(
        environment,
        environment._temps[`CreateLiteralAnimation${animation.id}`],
        null
    ) as DataState;

    data.transform.z = remap(t, 0, 1, 3, 1);
}

function onEnd(
    animation: CreateLiteralAnimation,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);
    delete environment._temps[`CreateLiteralAnimation${animation.id}`];
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
