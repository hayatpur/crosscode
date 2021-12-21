import {
    createData,
    replacePrototypicalDataWith,
} from '../../../environment/data/data'
import {
    DataType,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    getMemoryLocation,
    removeAt,
    resolvePath,
} from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
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
    view: RootViewState,
    options: AnimationRuntimeOptions
) {
    const environment = view.environment

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
    ] as PrototypicalDataState

    if (original == undefined && property.value != null) {
        original = createData(
            DataType.Literal,
            undefined,
            `${animation.id}_Undefined`
        )

        // Create property
        object.value[property.value as number] = original
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
            }
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
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: FindMember,
    view: RootViewState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: GetMember,
    obj: AnimationData,
    property: AnimationData
) {
    animation._reads = [obj, property]
    animation._writes = [obj, property]
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
