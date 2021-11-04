import { createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'
import { GetMember } from './GetMember'

export interface FindMember extends AnimationNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function onBegin(animation: FindMember, view: ViewState, options: AnimationRuntimeOptions) {
    // const environment = getCurrentEnvironment(view);

    // const object = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`) as DataState;

    // // Get property
    // const property = resolvePath(environment, animation.propertyRegister, `${animation.id}_Property`) as DataState;

    // // Consume property
    // removeAt(environment, getMemoryLocation(environment, property).foundLocation);

    // const value = (object.value as DataState[])[animation.property] as DataState;

    // // Remove object (reference)
    // const objectReference = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`, null, {
    //     noResolvingReference: true,
    // }) as DataState;
    // removeAt(environment, getMemoryLocation(environment, objectReference).foundLocation, {
    //     noResolvingReference: true,
    // });

    // // Point the output register to the newly created data
    // const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState;
    // replaceDataWith(outputRegister, createData(DataType.ID, value.id, `${animation.id}_OutputRegister`));

    const environment = getCurrentEnvironment(view)

    // Get object
    const object = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`) as DataState
    console.assert(object.type === DataType.Array, `${animation.id}_Object is not an object`)

    // Get property
    const property = resolvePath(environment, animation.propertyRegister, `${animation.id}_Property`) as DataState
    const propertyLocation = getMemoryLocation(environment, property).foundLocation

    // Get original data
    const original = (object.value as DataState[])[property.value as number] as DataState

    // Consume property
    removeAt(environment, getMemoryLocation(environment, property).foundLocation)

    // Remove object (reference)
    const objectReference = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`, null, {
        noResolvingReference: true,
    }) as DataState
    const objectLocation = getMemoryLocation(environment, objectReference).foundLocation
    removeAt(environment, getMemoryLocation(environment, objectReference).foundLocation, {
        noResolvingReference: true,
    })

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
    const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
    replaceDataWith(outputRegister, createData(DataType.ID, original.id, `${animation.id}_OutputRegister`))
}

function onSeek(animation: FindMember, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: FindMember, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: GetMember, obj: AnimationData, property: AnimationData) {
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
