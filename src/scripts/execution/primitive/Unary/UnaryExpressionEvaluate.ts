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
    EnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    DataState,
    DataType,
} from '../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type UnaryExpressionEvaluate = ExecutionNode & {
    specifier: Accessor[]
    operator: ESTree.UnaryOperator
    outputRegister: Accessor[]
}

function apply(
    animation: UnaryExpressionEvaluate,
    environment: EnvironmentState
) {
    // Find arg
    let arg = resolvePath(
        environment,
        animation.specifier,
        `${animation.id}_Left`
    ) as DataState

    // Evaluated
    const evaluated = createPrimitiveData(
        DataType.Literal,
        computeUnaryExpression(arg.value, animation.operator),
        `${animation.id}_EvaluatedData`
    )
    addDataAt(environment, evaluated, [], null)

    computeReadAndWrites(
        animation,
        {
            location: getMemoryLocation(environment, arg).foundLocation,
            id: arg.id,
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
        replaceDataWith(
            output,
            createPrimitiveData(
                DataType.ID,
                evaluated.id,
                `${animation.id}_Placed`
            )
        )
    } else {
        removeAt(
            environment,
            getMemoryLocation(environment, evaluated).foundLocation
        )
    }

    removeAt(environment, getMemoryLocation(environment, arg).foundLocation)
}

function computeReadAndWrites(
    animation: UnaryExpressionEvaluate,
    original: DataInfo,
    evaluatedData: DataInfo
) {
    animation._reads = [original]
    animation._writes = [evaluatedData]
}

export function unaryExpressionEvaluate(
    specifier: Accessor[],
    operator: ESTree.UnaryOperator,
    outputRegister: Accessor[]
): UnaryExpressionEvaluate {
    return {
        ...createExecutionNode(null),
        _name: 'UnaryExpressionEvaluate',

        // name: `Binary Evaluate ${accessorsToString(leftSpecifier)} ${operator} ${accessorsToString(
        //     rightSpecifier
        // )} onto ${accessorsToString(outputRegister)}`,

        name: `Binary ${operator}`,

        // Attributes
        specifier,
        operator,
        outputRegister,

        // Callbacks
        apply,
    }
}

function computeUnaryExpression(data: any, operator: ESTree.UnaryOperator) {
    switch (operator) {
        case '-':
            return -data
        case '+':
            return +data
        case '!':
            return !data
        case '~':
            return ~data
        case 'typeof':
            return typeof data
        case 'void':
            return void data
        default:
            throw new Error(`Unknown unary operator: ${operator}`)
    }
}
