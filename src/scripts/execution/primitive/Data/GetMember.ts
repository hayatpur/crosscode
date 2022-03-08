import { cloneData, createPrimitiveData, replaceDataWith } from '../../../environment/data'
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import { Accessor, EnvironmentState } from '../../../environment/EnvironmentState'
import {
    DataState,
    DataType,
    instanceOfData,
} from '../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface GetMember extends ExecutionNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function apply(animation: GetMember, environment: EnvironmentState) {
    // Get object
    const object = resolvePath(
        environment,
        animation.objectRegister,
        `${animation.id}_Object`
    ) as DataState

    // Get property
    const property = resolvePath(
        environment,
        animation.propertyRegister,
        `${animation.id}_Property`
    ) as DataState
    const propertyLocation = getMemoryLocation(environment, property).foundLocation

    // Index into it
    const original = (object.value as DataState[])[property.value as number | string]

    let copy: DataState

    if (instanceOfData(original)) {
        // Create a copy of data
        copy = cloneData(original, false, `${animation.id}_Copy`)
    } else {
        // Create a new data
        copy = createPrimitiveData(DataType.Literal, original, `${animation.id}_Copy`)
    }

    const location = addDataAt(environment, copy, [], null)

    // Consume property
    removeAt(environment, getMemoryLocation(environment, property).foundLocation)

    // Remove object (reference)
    const objectReference = resolvePath(
        environment,
        animation.objectRegister,
        `${animation.id}_Object`,
        null,
        {
            noResolvingReference: true,
        }
    ) as DataState
    const objectLocation = getMemoryLocation(environment, objectReference).foundLocation

    removeAt(environment, getMemoryLocation(environment, objectReference).foundLocation, {
        noResolvingReference: true,
    })

    const propertyData = {
        location: propertyLocation,
        id: property.id,
    }

    const objectData = {
        location: objectLocation,
        id: objectReference.id,
    }

    const copyData = { location, id: copy.id }

    if (instanceOfData(original)) {
        computeReadAndWrites(animation, objectData, propertyData, copyData, {
            location: getMemoryLocation(environment, original).foundLocation,
            id: original.id,
        })
    } else {
        computeReadAndWrites(animation, objectData, propertyData, copyData)
    }

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as DataState
    replaceDataWith(
        outputRegister,
        createPrimitiveData(DataType.ID, copy.id, `${animation.id}_OutputRegister`)
    )
}

function computeReadAndWrites(
    animation: GetMember,
    obj: DataInfo,
    property: DataInfo,
    copy: DataInfo,
    original: DataInfo = null
) {
    animation._reads = original != null ? [original, obj, property] : [obj, property]
    animation._writes = [copy, obj]
}

export function getMember(
    objectRegister: Accessor[],
    propertyRegister: Accessor[],
    outputRegister: Accessor[]
): GetMember {
    return {
        ...createExecutionNode(null),
        _name: 'GetMember',

        name: 'GetMember',

        // Attributes
        objectRegister,
        propertyRegister,
        outputRegister,

        // Callbacks
        apply,
    }
}
