import * as ESTree from 'estree'
import { createData } from '../../../environment/data/data'
import { DataType, PrototypicalDataState } from '../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { getNumericalValueOfStyle, getRelativeLocation, lerp, remap, Vector } from '../../../utilities/math'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface BinaryExpressionEvaluate extends AnimationNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    operator: ESTree.BinaryOperator
    outputRegister: Accessor[]
}

function onBegin(animation: BinaryExpressionEvaluate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    // Find left data
    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as PrototypicalDataState
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }]

    // Find right data
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as PrototypicalDataState
    environment._temps[`RightData${animation.id}`] = [{ type: AccessorType.ID, value: right.id }]

    const data = createData(
        DataType.Literal,
        eval(`${left.value}${animation.operator}${right.value}`),
        `${animation.id}_EvaluatedData`
    )
    data.hints.elevation = 1
    data.hints.positionType = 'absolute'

    addDataAt(environment, data, [], null)
    updateRootViewLayout(view)

    // Get relative rendered positions
    data.hints.position = ['lerp', animation.leftSpecifier, animation.leftSpecifier, 0.5]
    data.hints.opacity = 0

    updateRootViewLayout(view)

    const dataAccessor = [{ type: AccessorType.ID, value: data.id }]
    left.hints.position = ['lerp', animation.leftSpecifier, dataAccessor, 0]
    right.hints.position = ['lerp', animation.rightSpecifier, dataAccessor, 0]

    environment._temps[`EvaluatedData${animation.id}`] = [{ type: AccessorType.ID, value: data.id }]

    // Target left transform
    environment._temps[`InitialLeftTransform${animation.id}`] = leftRenderLocation

    // Target right transform
    environment._temps[`InitialRightTransform${animation.id}`] = rightRenderLocation
}

function onSeek(
    animation: BinaryExpressionEvaluate,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState
    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState

    const leftTransform = environment._temps[`InitialLeftTransform${animation.id}`] as Vector
    const rightTransform = environment._temps[`InitialRightTransform${animation.id}`] as Vector

    const targetRenderLocation = getRelativeLocation(evaluated.transform.rendered, environment.transform.rendered)
    const targetRenderWidth = getNumericalValueOfStyle(evaluated.transform.styles.width || '0', 0)

    // Move left
    left.transform.styles.left = `${lerp(leftTransform.x, targetRenderLocation.x - targetRenderWidth / 4, t)}px`

    // Move right
    right.transform.styles.left = `${lerp(rightTransform.x, targetRenderLocation.x + targetRenderWidth / 4, t)}px`

    if (t > 0.5) {
        evaluated.transform.styles.opacity = `${remap(t, 0.5, 1, 0, 1)}`
    }

    if (t > 0.9) {
        left.transform.styles.opacity = `${remap(t, 0.9, 1, 1, 0)}`
        right.transform.styles.opacity = `${remap(t, 0.9, 1, 1, 0)}`
    }
}

function onEnd(animation: BinaryExpressionEvaluate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState
    const evaluated = resolvePath(environment, environment._temps[`EvaluatedData${animation.id}`], null) as DataState

    if (options.baking) {
        computeReadAndWrites(
            animation,
            { location: getMemoryLocation(environment, left).foundLocation, id: left.id },
            { location: getMemoryLocation(environment, right).foundLocation, id: right.id },
            { location: getMemoryLocation(environment, evaluated).foundLocation, id: evaluated.id }
        )
    }

    // Add evaluated to environment

    // Put it in the output register (if any)
    if (animation.outputRegister.length > 0) {
        const output = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
        replaceDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`))
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation)
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation)
    removeAt(environment, getMemoryLocation(environment, right).foundLocation)
}

function computeReadAndWrites(
    animation: BinaryExpressionEvaluate,
    leftData: AnimationData,
    rightData: AnimationData,
    evaluatedData: AnimationData
) {
    animation._reads = [leftData, rightData]
    animation._writes = [evaluatedData]
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
        _name: 'BinaryExpressionEvaluate',

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
    }
}

/*
    environment._temps[`InitialLeftTransform${animation.id}`] = {
        initLeft: left.transform.styles.left,
        initTop: left.transform.styles.top,
        targetLeft: data.transform.styles.left - data.transform.rendered.width / 4,
        targetTop: data.transform.styles.top,
    } as Vector;

    // Target right transform
    environment._temps[`InitialRightTransform${animation.id}`] = {
        initLeft: right.transform.styles.left,
        initTop: right.transform.styles.top,
        targetLeft: data.transform.styles.left + data.transform.rendered.width / 4,
        targetTop: data.transform.styles.top,
    } as Vector;*/
