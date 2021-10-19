import * as ESTree from 'estree';
import { createData, replaceDataWith } from '../../../environment/data/data';
import { DataState, DataType, PositionType } from '../../../environment/data/DataState';
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

interface IntermediatePositionStorage {
    initLeft: number;
    initTop: number;
    targetLeft: number;
    targetTop: number;
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
    data.transform.depth = 1;
    data.transform.positionType = PositionType.Absolute;
    addDataAt(environment, data, [], null);

    const el = document.createElement('div');
    data.transform.left = (left.transform.left + right.transform.left) / 2;
    data.transform.top = left.transform.top;
    data.transform.depth = 1;
    data.transform.opacity = 0;
    environment._temps[`EvaluatedData${animation.id}`] = [{ type: AccessorType.ID, value: data.id }];

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        initLeft: left.transform.left,
        initTop: left.transform.top,
        targetLeft: data.transform.left - data.transform.width / 4,
        targetTop: data.transform.top,
    } as IntermediatePositionStorage;

    // Target right transform
    environment._temps[`RightTransform${animation.id}`] = {
        initLeft: right.transform.left,
        initTop: right.transform.top,
        targetLeft: data.transform.left + data.transform.width / 4,
        targetTop: data.transform.top,
    } as IntermediatePositionStorage;
}

function onSeek(animation: BinaryExpressionEvaluate, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation));

    const environment = getCurrentEnvironment(view);
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState;
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState;
    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState;

    const leftTransform = environment._temps[`LeftTransform${animation.id}`] as IntermediatePositionStorage;
    const rightTransform = environment._temps[`RightTransform${animation.id}`] as IntermediatePositionStorage;

    // Move left
    left.transform.left = lerp(leftTransform.initLeft, leftTransform.targetLeft, t);
    left.transform.top = lerp(leftTransform.initTop, leftTransform.targetTop, t);

    // Move right
    right.transform.left = lerp(rightTransform.initLeft, rightTransform.targetLeft, t);
    right.transform.top = lerp(rightTransform.initTop, rightTransform.targetTop, t);

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
