import { createPrimitiveData, replaceDataWith } from '../../../environment/data'
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor, AccessorType, EnvironmentState } from '../../../environment/EnvironmentState'
import {
    DataState,
    DataType,
    instanceOfData,
    instanceOfObjectData,
} from '../../../renderer/View/Environment/data/DataState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'
import { GetMember } from './GetMember'

export interface FindMember extends ExecutionNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function apply(animation: FindMember, environment: EnvironmentState) {
    // Get object
    const object = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`) as DataState

    if (!instanceOfObjectData(object) && !(typeof object.value === 'string')) {
        throw new Error(`${animation.id}_Object is not an object`)
    }

    const objectLocation = getMemoryLocation(environment, object).foundLocation

    // Get property
    const property = resolvePath(environment, animation.propertyRegister, `${animation.id}_Property`) as DataState
    const propertyLocation = getMemoryLocation(environment, property).foundLocation

    console.log('Property', property)

    // Get original data
    let original = resolvePath(
        environment,
        [...objectLocation, { type: AccessorType.Index, value: property.value as string }],
        `${animation.id}_MemberFunction`
    ) as DataState | Function

    console.log('Original', original)

    let originalModified = false

    if (!instanceOfData(original)) {
        original = createPrimitiveData(DataType.Literal, original, `${animation.id}_MemberFunction`)
        addDataAt(environment, original, [], null)
        originalModified = true
    }

    if (original == undefined && property.value != null) {
        original = createPrimitiveData(DataType.Literal, undefined, `${animation.id}_Undefined`)

        // Create property
        object.value[property.value as number] = original

        originalModified = true
    }

    // Consume property
    removeAt(environment, getMemoryLocation(environment, property).foundLocation)

    // Remove object (reference)
    const objectReference = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`, null, {
        noResolvingReference: true,
    }) as DataState
    const objectReferenceLocation = getMemoryLocation(environment, objectReference).foundLocation
    removeAt(environment, getMemoryLocation(environment, objectReference).foundLocation, {
        noResolvingReference: true,
    })

    computeReadAndWrites(
        animation,
        {
            location: objectReferenceLocation,
            id: objectReference.id,
        },
        {
            location: propertyLocation,
            id: property.id,
        },
        originalModified
            ? {
                  location: getMemoryLocation(environment, original).foundLocation,

                  id: original.id,
              }
            : null
    )

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
    replaceDataWith(outputRegister, createPrimitiveData(DataType.ID, original.id, `${animation.id}_OutputRegister`))
}

function computeReadAndWrites(
    animation: GetMember,
    obj: DataInfo,
    property: DataInfo,
    original: DataInfo | null = null
) {
    animation._reads = [obj, property]
    animation._writes = original != null ? [obj, original] : [obj]
}

export function findMember(
    objectRegister: Accessor[],
    propertyRegister: Accessor[],
    outputRegister: Accessor[]
): FindMember {
    return {
        ...createExecutionNode(null),
        _name: 'FindMember',

        name: 'FindMember',

        // Attributes
        objectRegister,
        propertyRegister,
        outputRegister,

        // Callbacks
        apply,
    }
}
