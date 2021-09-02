import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import { addDataAt, resolvePath, updateEnvironmentLayout } from '../../../environment/environment';
import { Accessor, accessorsToString } from '../../../environment/EnvironmentState';
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

function onBegin(animation: CreateLiteralAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const data = createData(DataType.Literal, animation.value as number | string | boolean, `${animation.id}_Create`);
    data.transform.floating = true;

    const environment = getCurrentEnvironment(view);
    environment._temps[`CreateLiteralAnimation${animation.id}`] = addDataAt(environment, data, [], null);

    // Get the output data
    const location = resolvePath(environment, animation.locationHint, `${animation.id}_Location`) as DataState;

    // if (options.baking) {
    //     this.computeReadAndWrites({
    //         location: environment._temps[`CreateLiteralAnimation${this.id}`],
    //         id: data.id,
    //     });
    // }

    updateEnvironmentLayout(environment);

    data.transform.x = location.transform?.x ?? 0;
    data.transform.y = location.transform?.y ?? 0;

    // Put it in the floating stack
    const outputRegister = resolvePath(environment, this.outputRegister, `${this.id}_Floating`) as DataState;
    replaceDataWith(outputRegister, createData(DataType.ID, data.id, `${this.id}_Floating`));
}

function onSeek(animation: CreateLiteralAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const data = resolvePath(
        environment,
        environment._temps[`CreateLiteralAnimation${animation.id}`],
        null
    ) as DataState;

    data.transform.z = remap(t, 0, 1, 3, 1);
}

function onEnd(animation: CreateLiteralAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

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
