import {
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
import {
    Accessor,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import {
    AnimationData,
    AnimationRuntimeOptions,
} from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'
import { GetMember } from './GetMember'

export interface FindMember extends AnimationNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function onBegin(
    animation: FindMember,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    // Get object
    const object = resolvePath(
        environment,
        animation.objectRegister,
        `${animation.id}_Object`
    ) as PrototypicalDataState
    console.assert(
        object.type === DataType.Array,
        `${animation.id}_Object is not an object`
    )

    // Get property
    const property = resolvePath(
        environment,
        animation.propertyRegister,
        `${animation.id}_Property`
    ) as PrototypicalDataState
    const propertyLocation = getMemoryLocation(
        environment,
        property
    ).foundLocation

    // Get original data
    let original = (object.value as PrototypicalDataState[])[
        property.value as number
    ] as PrototypicalDataState | Function

    let originalModified = false

    if (!instanceOfPrototypicalData(original)) {
        original = createData(
            DataType.Literal,
            original,
            `${animation.id}_MemberFunction`
        )
        addDataAt(environment, original, [], null)
        originalModified = true
    }

    if (original == undefined && property.value != null) {
        original = createData(
            DataType.Literal,
            undefined,
            `${animation.id}_Undefined`
        )

        // Create property
        object.value[property.value as number] = original

        originalModified = true
    }

    // Consume property
    removeAt(
        environment,
        getMemoryLocation(environment, property).foundLocation
    )

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
    const objectLocation = getMemoryLocation(
        environment,
        objectReference
    ).foundLocation
    removeAt(
        environment,
        getMemoryLocation(environment, objectReference).foundLocation,
        {
            noResolvingReference: true,
        }
    )

    if (options.baking) {
        computeReadAndWrites(
            animation,
            {
                location: objectLocation,
                id: objectReference.id,
            },
            {
                location: propertyLocation,
                id: property.id,
            },
            originalModified
                ? {
                      location: getMemoryLocation(environment, original)
                          .foundLocation,

                      id: original.id,
                  }
                : null
        )
    }

    // Point the output register to the newly created data
    const outputRegister = resolvePath(
        environment,
        animation.outputRegister,
        `${animation.id}_Floating`
    ) as PrototypicalDataState
    replacePrototypicalDataWith(
        outputRegister,
        createData(DataType.ID, original.id, `${animation.id}_OutputRegister`)
    )
}

function onSeek(
    animation: FindMember,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: FindMember,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: GetMember,
    obj: AnimationData,
    property: AnimationData,
    original: AnimationData | null = null
) {
    animation._reads = [obj, property]
    animation._writes = original != null ? [obj, original] : [obj]
}

export function findMember(
    objectRegister: Accessor[],
    propertyRegister: Accessor[],
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): FindMember {
    return {
        ...createAnimationNode(null, options),
        _name: 'FindMember',

        name: 'FindMember',

        // Attributes
        objectRegister,
        propertyRegister,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
