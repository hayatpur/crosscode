import {
    createObjectData,
    createPrimitiveData,
    replaceDataWith,
} from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { addDataAt, resolvePath } from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    EnvironmentState,
} from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface ArrayStartAnimation extends ExecutionNode {
    dataSpecifier: Accessor[]
}

function apply(animation: ArrayStartAnimation, environment: EnvironmentState) {
    // Create a new array somewhere in memory
    const data = createObjectData([], `${animation.id}_CreateArray`)

    const loc = addDataAt(environment, data, [], null)

    computeReadAndWrites(animation, {
        location: loc,
        id: data.id,
    })

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.dataSpecifier,
        `${animation.id}_Floating`
    ) as DataState
    replaceDataWith(
        outputRegister,
        createPrimitiveData(DataType.ID, data.id, `${animation.id}_OutputRegister`)
    )
}

function computeReadAndWrites(animation: ArrayStartAnimation, data: DataInfo) {
    animation._reads = [data]
    animation._writes = [data]
}

export function arrayStartAnimation(dataSpecifier: Accessor[]): ArrayStartAnimation {
    return {
        ...createExecutionNode(null),

        _name: 'ArrayStartAnimation',

        name: `Initialize array at ${accessorsToString(dataSpecifier)}`,

        // Attributes
        dataSpecifier,

        // Callbacks
        apply,
    }
}
