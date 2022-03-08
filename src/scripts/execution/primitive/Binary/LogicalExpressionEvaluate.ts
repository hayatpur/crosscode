import * as ESTree from 'estree'
import { createPrimitiveData, replaceDataWith } from '../../../environment/data'
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    EnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    DataState,
    DataType,
    PrimitiveDataState,
} from '../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface LogicalExpressionEvaluate extends ExecutionNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    shortCircuit: boolean
    operator: ESTree.LogicalOperator
    outputRegister: Accessor[]
}

function apply(animation: LogicalExpressionEvaluate, environment: EnvironmentState) {
    // Find left data
    let left = resolvePath(
        environment,
        animation.leftSpecifier,
        `${animation.id}_Left`
    ) as DataState

    let evaluated: DataState, right: DataState

    if (animation.shortCircuit) {
        evaluated = createPrimitiveData(
            DataType.Literal,
            (left as PrimitiveDataState).value,
            `${animation.id}_EvaluatedData`
        )
        addDataAt(environment, evaluated, [], null)
    } else {
        // Find right data
        right = resolvePath(
            environment,
            animation.rightSpecifier,
            `${animation.id}_Right`
        ) as DataState

        evaluated = createPrimitiveData(
            DataType.Literal,
            eval(`${left.value}${animation.operator}${right.value}`),
            `${animation.id}_EvaluatedData`
        )
        addDataAt(environment, evaluated, [], null)
    }

    // Reads and writes

    const leftData = {
        location: getMemoryLocation(environment, left).foundLocation,
        id: left.id,
    }
    const rightData =
        right == null
            ? null
            : {
                  location: getMemoryLocation(environment, right).foundLocation,
                  id: right.id,
              }
    const evaluatedData = {
        location: getMemoryLocation(environment, evaluated).foundLocation,
        id: evaluated.id,
    }

    computeReadAndWrites(animation, leftData, rightData, evaluatedData)

    // Point output to evaluated
    if (animation.outputRegister.length > 0) {
        const output = resolvePath(
            environment,
            animation.outputRegister,
            `${animation.id}_Floating`
        ) as DataState
        replaceDataWith(
            output,
            createPrimitiveData(DataType.ID, evaluated.id, `${animation.id}_Placed`)
        )
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation)
    }

    // Clean up
    removeAt(environment, getMemoryLocation(environment, left).foundLocation)
    if (!animation.shortCircuit) {
        removeAt(environment, getMemoryLocation(environment, right).foundLocation)
    }
}

function computeReadAndWrites(
    animation: LogicalExpressionEvaluate,
    leftData: DataInfo,
    rightData: DataInfo,
    evaluatedData: DataInfo
) {
    animation._reads = rightData == null ? [leftData] : [leftData, rightData]
    animation._writes = [evaluatedData]
}

export function logicalExpressionEvaluate(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    shortCircuit: boolean,
    operator: ESTree.LogicalOperator,
    outputRegister: Accessor[]
): LogicalExpressionEvaluate {
    return {
        ...createExecutionNode(),
        _name: 'LogicalExpressionEvaluate',

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
        apply,
    }
}
