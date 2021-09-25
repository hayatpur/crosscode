import * as ESTree from 'estree';
import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType, PositionType } from '../../../environment/data/DataState';
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment';
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState';
import { lerp, remap } from '../../../utilities/math';
import { getCurrentEnvironment } from '../../../view/view';
import { ViewState } from '../../../view/ViewState';
import { duration } from '../../animation';
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode';

export interface LogicalExpressionEvaluate extends AnimationNode {
    leftSpecifier: Accessor[];
    rightSpecifier: Accessor[];
    shortCircuit: boolean;
    operator: ESTree.LogicalOperator;
    outputRegister: Accessor[];
}

function onBegin(
    animation: LogicalExpressionEvaluate,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);

    // Find left data
    let left = resolvePath(
        environment,
        animation.leftSpecifier,
        `${animation.id}_Left`
    ) as DataState;
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }];

    let data, right;

    if (animation.shortCircuit) {
        data = createData(DataType.Literal, left.value, `${animation.id}_EvaluatedData`);
        data.transform.z = 1;
        data.transform.positionType = PositionType.Absolute;
        addDataAt(environment, data, [], null);
    } else {
        // Find right data
        right = resolvePath(
            environment,
            animation.rightSpecifier,
            `${animation.id}_Right`
        ) as DataState;
        environment._temps[`RightData${animation.id}`] = [
            { type: AccessorType.ID, value: right.id },
        ];

        data = createData(
            DataType.Literal,
            eval(`${left.value}${animation.operator}${right.value}`),
            `${animation.id}_EvaluatedData`
        );
        data.transform.z = 1;
        data.transform.positionType = PositionType.Absolute;
        addDataAt(environment, data, [], null);
    }

    data.transform.x = animation.shortCircuit
        ? left.transform.x
        : (left.transform.x + right.transform.x) / 2;
    data.transform.y = left.transform.y;
    data.transform.z = 1;
    data.transform.opacity = 0;
    environment._temps[`EvaluatedData${animation.id}`] = [
        { type: AccessorType.ID, value: data.id },
    ];

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        init_x: left.transform.x,
        init_y: left.transform.y,
        x: data.transform.x,
        y: data.transform.y,
    };

    // Target right transform
    if (!animation.shortCircuit) {
        environment._temps[`RightTransform${animation.id}`] = {
            init_x: right.transform.x,
            init_y: right.transform.y,
            x: data.transform.x + data.transform.width / 4,
            y: data.transform.y,
        };
    }
}

function onSeek(
    animation: LogicalExpressionEvaluate,
    view: ViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const left = resolvePath(
        environment,
        environment._temps[`LeftData${animation.id}`],
        null
    ) as DataState;

    const evaluated = resolvePath(
        environment,
        environment._temps[`EvaluatedData${animation.id}`],
        null
    ) as DataState;

    const leftTransform = environment._temps[`LeftTransform${animation.id}`];
    const rightTransform = environment._temps[`RightTransform${animation.id}`];

    // Move left
    left.transform.x = lerp(leftTransform.init_x, leftTransform.x, t);
    left.transform.y = lerp(leftTransform.init_y, leftTransform.y, t);

    // Move right
    let right;
    if (!animation.shortCircuit) {
        right = resolvePath(
            environment,
            environment._temps[`RightData${animation.id}`],
            null
        ) as DataState;
        right.transform.x = lerp(rightTransform.init_x, rightTransform.x, t);
        right.transform.y = lerp(rightTransform.init_y, rightTransform.y, t);
    }

    if (t > 0.5) {
        evaluated.transform.opacity = remap(t, 0.5, 1, 0, 1);
    }

    if (t > 0.9) {
        left.transform.opacity = remap(t, 0.9, 1, 1, 0);

        if (!animation.shortCircuit) {
            right.transform.opacity = remap(t, 0.9, 1, 1, 0);
        }
    }
}

function onEnd(
    animation: LogicalExpressionEvaluate,
    view: ViewState,
    options: AnimationRuntimeOptions
) {
    const environment = getCurrentEnvironment(view);

    const left = resolvePath(
        environment,
        environment._temps[`LeftData${animation.id}`],
        null
    ) as DataState;

    if (animation.shortCircuit) {
    }

    const evaluated = resolvePath(
        environment,
        environment._temps[`EvaluatedData${animation.id}`],
        null
    ) as DataState;

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
        const output = resolvePath(
            environment,
            animation.outputRegister,
            `${animation.id}_Floating`
        ) as DataState;
        replaceDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`));
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation);
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation);

    if (!animation.shortCircuit) {
        const right = resolvePath(
            environment,
            environment._temps[`RightData${animation.id}`],
            null
        ) as DataState;
        removeAt(environment, getMemoryLocation(environment, right).foundLocation);
    }
}

export function logicalExpressionEvaluate(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    shortCircuit: boolean,
    operator: ESTree.LogicalOperator,
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): LogicalExpressionEvaluate {
    return {
        ...createAnimationNode(null, options),
        baseDuration: 30,

        name: `Logical Evaluate ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(
            rightSpecifier
        )} onto ${accessorsToString(outputRegister)}`,

        // Attributes
        leftSpecifier,
        rightSpecifier,
        shortCircuit,
        operator,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    };
}
