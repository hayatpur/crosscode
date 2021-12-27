import * as ESTree from 'estree'
import {
    createData,
    replacePrototypicalDataWith,
} from '../../../environment/data/data'
import {
    DataType,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    AccessorType,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { duration } from '../../animation'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface LogicalExpressionEvaluate extends AnimationNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    shortCircuit: boolean
    operator: ESTree.LogicalOperator
    outputRegister: Accessor[]
}

function onBegin(
    animation: LogicalExpressionEvaluate,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    // Find left data
    let left = resolvePath(
        environment,
        animation.leftSpecifier,
        `${animation.id}_Left`
    ) as PrototypicalDataState
    let data: PrototypicalDataState, right: PrototypicalDataState

    if (animation.shortCircuit) {
        data = createData(
            DataType.Literal,
            left.value,
            `${animation.id}_EvaluatedData`
        )
        addDataAt(environment, data, [], null)
    } else {
        // Find right data
        right = resolvePath(
            environment,
            animation.rightSpecifier,
            `${animation.id}_Right`
        ) as PrototypicalDataState
        data = createData(
            DataType.Literal,
            eval(`${left.value}${animation.operator}${right.value}`),
            `${animation.id}_EvaluatedData`
        )
        addDataAt(environment, data, [], null)
    }
}

function onSeek(
    animation: LogicalExpressionEvaluate,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {
    let t = animation.ease(time / duration(animation))
    const environment = view
}

function onEnd(
    animation: LogicalExpressionEvaluate,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const left = resolvePath(
        environment,
        animation.leftSpecifier,
        null
    ) as PrototypicalDataState
    const evaluated = resolvePath(
        environment,
        [{ type: AccessorType.ID, value: `${animation.id}_EvaluatedData` }],
        null
    ) as PrototypicalDataState

    if (options.baking) {
        if (!animation.shortCircuit) {
            const right = resolvePath(
                environment,
                animation.rightSpecifier,
                `${animation.id}_Right`
            ) as PrototypicalDataState
            computeReadAndWrites(
                animation,
                {
                    location: getMemoryLocation(environment, left)
                        .foundLocation,
                    id: left.id,
                },
                {
                    location: getMemoryLocation(environment, right)
                        .foundLocation,
                    id: right.id,
                },
                {
                    location: getMemoryLocation(environment, evaluated)
                        .foundLocation,
                    id: evaluated.id,
                }
            )
        } else {
            computeReadAndWrites(
                animation,
                {
                    location: getMemoryLocation(environment, left)
                        .foundLocation,
                    id: left.id,
                },
                null,
                {
                    location: getMemoryLocation(environment, evaluated)
                        .foundLocation,
                    id: evaluated.id,
                }
            )
        }
    }

    if (animation.outputRegister.length > 0) {
        const output = resolvePath(
            environment,
            animation.outputRegister,
            `${animation.id}_Floating`
        ) as PrototypicalDataState
        replacePrototypicalDataWith(
            output,
            createData(DataType.ID, evaluated.id, `${animation.id}_Placed`)
        )
    } else {
        removeAt(
            environment,
            getMemoryLocation(environment, evaluated).foundLocation
        )
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation)

    if (!animation.shortCircuit) {
        const right = resolvePath(
            environment,
            animation.rightSpecifier,
            `${animation.id}_Right`
        ) as PrototypicalDataState
        removeAt(
            environment,
            getMemoryLocation(environment, right).foundLocation
        )
    }
}

function computeReadAndWrites(
    animation: LogicalExpressionEvaluate,
    leftData: AnimationData,
    rightData: AnimationData,
    evaluatedData: AnimationData
) {
    animation._reads = rightData == null ? [leftData] : [leftData, rightData]
    animation._writes = [evaluatedData]
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

        name: `Logical Evaluate ${accessorsToString(
            leftSpecifier
        )} ${operator} ${accessorsToString(
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
