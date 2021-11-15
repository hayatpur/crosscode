import { cloneData, createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { addDataAt, getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { updateRootViewLayout } from '../../../environment/layout'
import { getRelativeLocation } from '../../../utilities/math'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface GetMember extends AnimationNode {
    objectRegister: Accessor[]
    propertyRegister?: Accessor[] // Only if computed
    outputRegister: Accessor[]
}

function onBegin(animation: GetMember, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    // Get object
    const object = resolvePath(environment, animation.objectRegister, `${animation.id}_Object`) as DataState
    console.assert(object.type === DataType.Array, `${animation.id}_Object is not an object`)

    // Get property
    const property = resolvePath(environment, animation.propertyRegister, `${animation.id}_Property`) as DataState
    const propertyLocation = getMemoryLocation(environment, property).foundLocation

    // Get original data
    const original = (object.value as DataState[])[property.value as number] as DataState

    // Create a copy of data
    const copy = cloneData(original, false, `${animation.id}_Copy`)
    copy.transform.styles.elevation = 0
    copy.transform.styles.position = 'absolute'
    const renderLocation = getRelativeLocation(original.transform.rendered, environment.transform.rendered) // Copy the correct render location
    copy.transform.styles.left = `${renderLocation.x}px`
    copy.transform.styles.top = `${renderLocation.y}px`
    const location = addDataAt(environment, copy, [], null)
    environment._temps[`CopyMemberAnimation${animation.id}`] = location
    updateRootViewLayout(view)

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
            },
            { location, id: copy.id },
            { location: getMemoryLocation(environment, original).foundLocation, id: original.id }
        )
    }

    // Point the output register to the newly created data
    const outputRegister = resolvePath(environment, animation.outputRegister, `${animation.id}_Floating`) as DataState
    replaceDataWith(outputRegister, createData(DataType.ID, copy.id, `${animation.id}_OutputRegister`))
}

function onSeek(animation: GetMember, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))

    const environment = view.environment
    const copy = resolvePath(environment, environment._temps[`CopyMemberAnimation${animation.id}`], null) as DataState
    copy.transform.styles.elevation = t
}

function onEnd(animation: GetMember, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const copy = resolvePath(environment, environment._temps[`CopyMemberAnimation${animation.id}`], null) as DataState
    copy.transform.styles.elevation = 1
    copy.transform.styles.position = 'absolute'
}

function computeReadAndWrites(
    animation: GetMember,
    obj: AnimationData,
    property: AnimationData,
    copy: AnimationData,
    original: AnimationData
) {
    animation._reads = [original, obj, property]
    animation._writes = [copy, obj]
}

export function getMember(
    objectRegister: Accessor[],
    propertyRegister: Accessor[],
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): GetMember {
    return {
        ...createAnimationNode(null, options),
        _name: 'GetMember',

        name: 'GetMember',

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
