import * as ESTree from 'estree'
import { createData, replacePrototypicalDataWith } from '../../../environment/data/data'
import { PrototypicalDataState, DataType } from '../../../environment/data/DataState'
import { resolvePath, addDataAt, getMemoryLocation, removeAt } from '../../../environment/environment'
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
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

    // Find right data
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as PrototypicalDataState

    const data = createData(
        DataType.Literal,
        eval(`${left.value}${animation.operator}${right.value}`),
        `${animation.id}_EvaluatedData`
    )

    addDataAt(environment, data, [], null)
    updateRootViewLayout(view)
}

function onSeek(
    animation: BinaryExpressionEvaluate,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view.environment
}

function onEnd(animation: BinaryExpressionEvaluate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as PrototypicalDataState
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as PrototypicalDataState

    const evaluated = resolvePath(environment, [{type: AccessorType.ID, value: `${animation.id}_EvaluatedData`}], null) as PrototypicalDataState
    
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
        const output = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as PrototypicalDataState
        replacePrototypicalDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`))
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation)
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation)
    removeAt(environment, getMemoryLocation(environment, right).foundLocation)

    updateRootViewLayout(view)
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
