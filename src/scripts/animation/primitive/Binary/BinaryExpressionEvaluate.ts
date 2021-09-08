import * as ESTree from 'estree';
import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType } from '../../../environment/data/DataState';
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment';
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState';
import { lerp, remap } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface BinaryExpressionEvaluate extends AnimationNode {
    leftSpecifier: Accessor[];
    rightSpecifier: Accessor[];
    operator: ESTree.BinaryOperator;
    outputRegister: Accessor[];
}

function onBegin(animation: BinaryExpressionEvaluate, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    // Find left data
    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as DataState;
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }];

    // Find right data
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as DataState;
    environment._temps[`RightData${animation.id}`] = [{ type: AccessorType.ID, value: right.id }];

    const data = createData(
        DataType.Literal,
        eval(`${left.value}${animation.operator}${right.value}`),
        `${animation.id}_EvaluatedData`
    );
    data.transform.floating = true;
    addDataAt(environment, data, [], null);

    data.transform.x = (left.transform.x + right.transform.x) / 2;
    data.transform.y = left.transform.y;
    data.transform.z = 1;
    data.transform.opacity = 0;
    environment._temps[`EvaluatedData${animation.id}`] = [{ type: AccessorType.ID, value: data.id }];

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        init_x: left.transform.x,
        init_y: left.transform.y,
        x: data.transform.x - data.transform.width / 4,
        y: data.transform.y,
    };

    // Target right transform
    environment._temps[`RightTransform${animation.id}`] = {
        init_x: right.transform.x,
        init_y: right.transform.y,
        x: data.transform.x + data.transform.width / 4,
        y: data.transform.y,
    };
}

function onSeek(animation: BinaryExpressionEvaluate, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState;
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState;
    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState;

    const leftTransform = environment._temps[`LeftTransform${animation.id}`];
    const rightTransform = environment._temps[`RightTransform${animation.id}`];

    // console.log(environment._temps[`LeftTransform${animation.id}`]);

    // Move left
    left.transform.x = lerp(leftTransform.init_x, leftTransform.x, t);
    left.transform.y = lerp(leftTransform.init_y, leftTransform.y, t);

    // Move right
    right.transform.x = lerp(rightTransform.init_x, rightTransform.x, t);
    right.transform.y = lerp(rightTransform.init_y, rightTransform.y, t);

    if (t > 0.5) {
        evaluated.transform.opacity = remap(t, 0.5, 1, 0, 1);
    }

    if (t > 0.9) {
        left.transform.opacity = remap(t, 0.9, 1, 1, 0);
        right.transform.opacity = remap(t, 0.9, 1, 1, 0);
    }
}

function onEnd(animation: BinaryExpressionEvaluate, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view);

    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState;
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState;
    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState;

    // if (options.baking) {
    //     animation.computeReadAndWrites(
    //         { location: getMemoryLocation(environment, (left).foundLocation, id: left.id },
    //         { location: getMemoryLocation(environment, (right).foundLocation, id: right.id },
    //         { location: getMemoryLocation(environment, (evaluated).foundLocation, id: evaluated.id }
    //     );
    // }

    // Add evaluated to environment

    // Put it in the output register (if any)
    if (animation.outputRegister.length > 0) {
        const output = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState;
        replaceDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`));
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation);
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation);
    removeAt(environment, getMemoryLocation(environment, right).foundLocation);
}

export function binaryExpressionEvaluate(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    operator: ESTree.BinaryOperator,
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): BinaryExpressionEvaluate {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 30,

        name: `Binary Evaluate ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(
            rightSpecifier
        )} onto ${accessorsToString(outputRegister)}`,

        // Attributes
        leftSpecifier,
        rightSpecifier,
        operator,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
