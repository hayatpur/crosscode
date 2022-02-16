import {
    clonePrototypicalData,
    createData,
    replacePrototypicalDataWith,
} from '../../../environment/data/data'
import {
    DataType,
    instanceOfPrototypicalData,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    addDataAt,
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import { Accessor, PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface GetMember extends ExecutionNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function apply(animation: GetMember, environment: PrototypicalEnvironmentState) {
    // Get object
    const object = resolvePath(
        environment,
        animation.objectRegister,
        `${animation.id}_Object`
    ) as PrototypicalDataState

    // Get property
    const property = resolvePath(
        environment,
        animation.propertyRegister,
        `${animation.id}_Property`
    ) as PrototypicalDataState
    const propertyLocation = getMemoryLocation(environment, property).foundLocation

    // Index into it
    const original = (object.value as PrototypicalDataState[])[property.value as number | string]

    let copy: PrototypicalDataState

    if (instanceOfPrototypicalData(original)) {
        // Create a copy of data
        copy = clonePrototypicalData(original, false, `${animation.id}_Copy`)
    } else {
        // Create a new data
        copy = createData(DataType.Literal, original, `${animation.id}_Copy`)
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
    ) as PrototypicalDataState
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

    if (instanceOfPrototypicalData(original)) {
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
    ) as PrototypicalDataState
    replacePrototypicalDataWith(
        outputRegister,
        createData(DataType.ID, copy.id, `${animation.id}_OutputRegister`)
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
