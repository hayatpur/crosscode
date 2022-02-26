import * as ESTree from 'estree'
import { createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface BinaryExpressionEvaluate extends ExecutionNode {
    leftSpecifier: Accessor[]
    rightSpecifier: Accessor[]
    operator: ESTree.BinaryOperator
    outputRegister: Accessor[]
}

function apply(animation: BinaryExpressionEvaluate, environment: EnvironmentState) {
    // Find left data
    let left = resolvePath(
        environment,
        animation.leftSpecifier,
        `${animation.id}_Left`
    ) as DataState

    // Find right data
    let right = resolvePath(
        environment,
        animation.rightSpecifier,
        `${animation.id}_Right`
    ) as DataState

    // Evaluated
    const evaluated = createData(
        DataType.Literal,
        computeBinaryExpression(left.value, right.value, animation.operator),
        `${animation.id}_EvaluatedData`
    )
    addDataAt(environment, evaluated, [], null)

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, left).foundLocation,
            id: left.id,
        },
        {
            location: getMemoryLocation(environment, right).foundLocation,
            id: right.id,
        },
        {
            location: getMemoryLocation(environment, evaluated).foundLocation,
            id: evaluated.id,
        }
    )

    // Point output to evaluated
    if (animation.outputRegister.length > 0) {
        const output = resolvePath(
            environment,
            animation.outputRegister,
            `${animation.id}_Floating`
        ) as DataState
        replaceDataWith(output, createData(DataType.ID, evaluated.id, `${animation.id}_Placed`))
    } else {
        removeAt(environment, getMemoryLocation(environment, evaluated).foundLocation)
    }

    removeAt(environment, getMemoryLocation(environment, left).foundLocation)
    removeAt(environment, getMemoryLocation(environment, right).foundLocation)
}

function computeReadAndWrites(
    animation: BinaryExpressionEvaluate,
    leftData: DataInfo,
    rightData: DataInfo,
    evaluatedData: DataInfo
) {
    animation._reads = [leftData, rightData]
    animation._writes = [evaluatedData]
}

export function binaryExpressionEvaluate(
    leftSpecifier: Accessor[],
    rightSpecifier: Accessor[],
    operator: ESTree.BinaryOperator,
    outputRegister: Accessor[]
): BinaryExpressionEvaluate {
    return {
        ...createExecutionNode(null),
        _name: 'BinaryExpressionEvaluate',

        // name: `Binary Evaluate ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(
        //     rightSpecifier
        // )} onto ${accessorsToString(outputRegister)}`,

        name: `Binary ${operator}`,

        // Attributes
        leftSpecifier,
        rightSpecifier,
        operator,
        outputRegister,

        // Callbacks
        apply,
    }
}

function computeBinaryExpression(left: any, right: any, operator: ESTree.BinaryOperator) {
    switch (operator) {
        case '+':
            return left + right
        case '-':
            return left - right
        case '*':
            return left * right
        case '/':
            return left / right
        case '%':
            return left % right
        case '**':
            return Math.pow(left, right)
        case '<<':
            return left << right
        case '>>':
            return left >> right
        case '>>>':
            return left >>> right
        case '&':
            return left & right
        case '|':
            return left | right
        case '^':
            return left ^ right
        case '==':
            return left == right
        case '!=':
            return left != right
        case '===':
            return left === right
        case '!==':
            return left !== right
        case '<':
            return left < right
        case '>':
            return left > right
        case '<=':
            return left <= right
        case '>=':
            return left >= right
        case 'instanceof':
            return left instanceof right
        case 'in':
            return left in right
        default:
            throw new Error(`Unsupported operator ${operator}`)
    }
}
