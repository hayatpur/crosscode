import * as ESTree from 'estree'
import { DataState } from '../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { Accessor, accessorsToString, AccessorType } from '../../../environment/EnvironmentState'
import { lerp } from '../../../utilities/math'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface BinaryExpressionSetup extends AnimationNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    operator: ESTree.BinaryOperator
}

interface IntermediatePositionStorage {
    initLeft: number
    initTop: number
    targetLeft: number
    targetTop: number
}

function onBegin(animation: BinaryExpressionSetup, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)

    // Find left data
    let left = resolvePath(environment, animation.leftSpecifier, `${animation.id}_Left`) as DataState
    environment._temps[`LeftData${animation.id}`] = [{ type: AccessorType.ID, value: left.id }]

    // Find right data
    let right = resolvePath(environment, animation.rightSpecifier, `${animation.id}_Right`) as DataState
    environment._temps[`RightData${animation.id}`] = [{ type: AccessorType.ID, value: right.id }]

    // Target left transform
    environment._temps[`LeftTransform${animation.id}`] = {
        initLeft: left.transform.styles.left,
        initTop: left.transform.styles.top,
        targetLeft:
            (parseFloat(left.transform.styles.left.toString()) + parseFloat(right.transform.styles.left.toString())) /
                2 -
            25,
        targetTop:
            (parseFloat(left.transform.styles.top.toString()) + parseFloat(right.transform.styles.top.toString())) / 2 -
            5,
    } as IntermediatePositionStorage

    // Target right transform
    environment._temps[`RightTransform${animation.id}`] = {
        initLeft: right.transform.styles.left,
        initTop: right.transform.styles.top,
        targetLeft:
            (parseFloat(left.transform.styles.left.toString()) + parseFloat(right.transform.styles.left.toString())) /
                2 +
            25,
        targetTop:
            (parseFloat(left.transform.styles.top.toString()) + parseFloat(right.transform.styles.top.toString())) / 2 -
            5,
    } as IntermediatePositionStorage

    if (options.baking) {
        computeReadAndWrites(
            animation,
            { location: getMemoryLocation(environment, left).foundLocation, id: left.id },
            { location: getMemoryLocation(environment, right).foundLocation, id: right.id }
        )
    }
}

function onSeek(animation: BinaryExpressionSetup, view: ViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = getCurrentEnvironment(view)
    const left = resolvePath(environment, environment._temps[`LeftData${animation.id}`], null) as DataState
    const right = resolvePath(environment, environment._temps[`RightData${animation.id}`], null) as DataState

    const leftTransform = environment._temps[`LeftTransform${animation.id}`]
    const rightTransform = environment._temps[`RightTransform${animation.id}`]

    // Move left
    left.transform.styles.left = `${lerp(leftTransform.init_x, leftTransform.x, t)}px`
    left.transform.styles.top = `${lerp(leftTransform.init_y, leftTransform.y, t)}px`

    // Move right
    right.transform.styles.left = `${lerp(rightTransform.init_x, rightTransform.x, t)}px`
    right.transform.styles.top = `${lerp(rightTransform.init_y, rightTransform.y, t)}px`
}

function onEnd(animation: BinaryExpressionSetup, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: BinaryExpressionSetup, leftData: AnimationData, rightData: AnimationData) {
    animation._reads = [leftData, rightData]
    animation._writes = []
}

export function binaryExpressionSetup(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    operator: ESTree.BinaryOperator,
    options: AnimationOptions = {}
): BinaryExpressionSetup {
    return {
        ...createAnimationNode(null, options),
        _name: 'BinaryExpressionSetup',

        baseDuration: 60,

        name: `Binary Setup ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(rightSpecifier)}`,

        // Attributes
        leftSpecifier,
        rightSpecifier,
        operator,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
