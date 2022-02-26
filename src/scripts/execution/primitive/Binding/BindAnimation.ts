import { createPrimitiveData } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import {
    addDataAt,
    declareVariable,
    getMemoryLocation,
    resolvePath,
} from '../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface BindAnimation extends ExecutionNode {
    identifier: string
    existingMemorySpecifier: Accessor[]
}

function apply(animation: BindAnimation, environment: EnvironmentState) {
    let data = null
    let location = null

    // Create a reference for variable
    const reference = createPrimitiveData(DataType.Reference, [], `${animation.id}_Reference`)
    const loc = addDataAt(environment, reference, [], `${animation.id}_Add`)

    if (animation.existingMemorySpecifier != null) {
        data = resolvePath(
            environment,
            animation.existingMemorySpecifier,
            `${animation.id}_Existing`
        ) as DataState
        location = getMemoryLocation(environment, data).foundLocation
    } else {
        data = createPrimitiveData(DataType.Literal, undefined, `${animation.id}_BindNew`)
        location = addDataAt(environment, data, [], null)
    }

    reference.value = location

    declareVariable(environment, animation.identifier, loc)

    computeReadAndWrites(
        animation,
        { location, id: data.id },
        { location: loc, id: reference.id },
        { location: loc, id: animation.identifier },
        animation.existingMemorySpecifier == null
    )
}

// TODO also add variable identifier as write
function computeReadAndWrites(
    animation: BindAnimation,
    data: DataInfo,
    reference: DataInfo,
    variable: DataInfo,
    dataCreated: boolean
) {
    animation._reads = [data]
    animation._writes = dataCreated ? [variable, reference, data] : [variable, reference]
}

export function bindAnimation(
    identifier: string,
    existingMemorySpecifier: Accessor[] = null
): BindAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'BindAnimation',

        // name: `Bind Variable (${identifier}), with data at ${accessorsToString(
        //     existingMemorySpecifier ?? []
        // )}`,
        name: `Bind Variable (${identifier})`,

        // Attributes
        identifier,
        existingMemorySpecifier,

        // Callbacks
        apply,
    }
}
