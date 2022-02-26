import { createPrimitiveData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { addDataAt, resolvePath } from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    EnvironmentState,
} from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface CreateLiteralAnimation extends ExecutionNode {
    value: string | number | bigint | boolean | RegExp
    locationHint: Accessor[]
    outputRegister: Accessor[]
}

/**
 * Puts data into context.output register.
 * @param animation
 * @param view
 * @param options
 */
function apply(animation: CreateLiteralAnimation, environment: EnvironmentState) {
    const data = createPrimitiveData(
        DataType.Literal,
        animation.value as number | string | boolean,
        `${animation.id}_Create`
    )

    // Add the newly created data to environment
    const loc = addDataAt(environment, data, [], null)

    computeReadAndWrites(animation, {
        location: loc,
        id: data.id,
    })

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as DataState
    replaceDataWith(
        outputRegister,
        createPrimitiveData(DataType.ID, data.id, `${animation.id}_OutputRegister`)
    )
}

function computeReadAndWrites(animation: CreateLiteralAnimation, data: DataInfo) {
    animation._reads = []
    animation._writes = [data]
}

export function createLiteralAnimation(
    value: string | number | bigint | boolean | RegExp,
    outputRegister: Accessor[],
    locationHint: Accessor[]
): CreateLiteralAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'CreateLiteralAnimation',
        name: `Create Literal ${value} at ${accessorsToString(outputRegister)}`,

        // Attributes
        value,
        outputRegister,
        locationHint,

        // Callbacks
        apply,
    }
}
