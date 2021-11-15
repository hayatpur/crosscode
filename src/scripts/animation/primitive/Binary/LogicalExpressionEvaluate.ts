import * as ESTree from 'estree'
import { createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface LogicalExpressionEvaluate extends AnimationNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    shortCircuit: boolean
    operator: ESTree.LogicalOperator
    outputRegister: Accessor[]
}

interface IntermediatePositionStorage {
    initLeft: number
    initTop: number
    targetLeft: number
    targetTop: number
}

function onBegin(animation: LogicalExpressionEvaluate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    // Find left data
    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as DataState
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }]

    let data: DataState, right: DataState

    if (animation.shortCircuit) {
        data = createData(DataType.Literal, left.value, `${animation.id}_EvaluatedData`)
        data.transform.styles.elevation = 1
        data.transform.styles.position = 'absolute'
        addDataAt(environment, data, [], null)
        updateRootViewLayout(view)
    } else {
        // Find right data
        right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as DataState
        environment._temps[`RightData${animation.id}`] = [{ type: AccessorType.ID, value: right.id }]

        data = createData(
            DataType.Literal,
            eval(`${left.value}${animation.operator}${right.value}`),
            `${animation.id}_EvaluatedData`
        )
        data.transform.styles.elevation = 1
        data.transform.styles.position = 'absolute'
        addDataAt(environment, data, [], null)
        updateRootViewLayout(view)
    }

    // data.transform.styles.left = animation.shortCircuit
    //     ? left.transform.styles.left
    //     : (left.transform.styles.left + right.transform.styles.left) / 2;
    // data.transform.styles.top = left.transform.styles.top;
    // data.transform.styles.elevation = 1;
    // data.transform.opacity = 0;
    // environment._temps[`EvaluatedData${animation.id}`] = [{ type: AccessorType.ID, value: data.id }];

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        initLeft: left.transform.styles.left,
        initTop: left.transform.styles.top,
        targetLeft: data.transform.styles.left,
        targetTop: data.transform.styles.top,
    } as IntermediatePositionStorage

    // Target right transform
    // if (!animation.shortCircuit) {
    //     environment._temps[`RightTransform${animation.id}`] = {
    //         initLeft: right.transform.styles.left,
    //         initTop: right.transform.styles.top,
    //         targetLeft: data.transform.styles.left + data.transform.rendered.width / 4,
    //         targetTop: data.transform.styles.top,
    //     } as IntermediatePositionStorage;
    // }
}

function onSeek(
    animation: LogicalExpressionEvaluate,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState

    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState

    const leftTransform = environment._temps[`LeftTransform${animation.id}`] as IntermediatePositionStorage
    const rightTransform = environment._temps[`RightTransform${animation.id}`] as IntermediatePositionStorage

    // Move left
    // left.transform.styles.left = lerp(leftTransform.initLeft, leftTransform.targetLeft, t);
    // left.transform.styles.top = lerp(leftTransform.initTop, leftTransform.targetTop, t);

    // Move right
    let right: DataState
    // if (!animation.shortCircuit) {
    //     right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState;
    //     right.transform.styles.left = lerp(rightTransform.initLeft, rightTransform.targetLeft, t);
    //     right.transform.styles.top = lerp(rightTransform.initTop, rightTransform.targetTop, t);
    // }

    // if (t > 0.5) {
    //     evaluated.transform.opacity = remap(t, 0.5, 1, 0, 1);
    // }

    // if (t > 0.9) {
    //     left.transform.opacity = remap(t, 0.9, 1, 1, 0);

    //     if (!animation.shortCircuit) {
    //         right.transform.opacity = remap(t, 0.9, 1, 1, 0);
    //     }
    // }
}

function onEnd(animation: LogicalExpressionEvaluate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState

    if (animation.shortCircuit) {
    }

    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState

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
        const output = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
        replaceDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`))
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation)
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation)

    if (!animation.shortCircuit) {
        const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState
        removeAt(environment, getMemoryLocation(environment, right).foundLocation)
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
        _name: 'LogicalExpressionEvaluate',

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
    }
}
