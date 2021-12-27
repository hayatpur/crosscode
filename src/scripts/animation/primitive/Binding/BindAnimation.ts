import { createData } from '../../../environment/data/data'
import {
    DataType,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import {
    addDataAt,
    declareVariable,
    getMemoryLocation,
    resolvePath,
} from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
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

export interface BindAnimation extends AnimationNode {
    identifier: string
    existingMemorySpecifier: Accessor[]
}

function onBegin(
    animation: BindAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    let data = null
    let location = null

    // Create a reference for variable
    const reference = createData(
        DataType.Reference,
        [],
        `${animation.id}_Reference`
    )
    const loc = addDataAt(environment, reference, [], `${animation.id}_Add`)

    if (animation.existingMemorySpecifier != null) {
        data = resolvePath(
            environment,
            animation.existingMemorySpecifier,
            `${animation.id}_Existing`
        ) as PrototypicalDataState
        location = getMemoryLocation(environment, data).foundLocation
    } else {
        data = createData(
            DataType.Literal,
            undefined,
            `${animation.id}_BindNew`
        )
        location = addDataAt(environment, data, [], null)
    }

    reference.value = location

    declareVariable(environment, animation.identifier, loc)

    if (options.baking) {
        computeReadAndWrites(
            animation,
            { location, id: data.id },
            { location: loc, id: reference.id },
            animation.existingMemorySpecifier == null
        )
    }
}

function onSeek(
    animation: BindAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: BindAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

// TODO also add variable identifier as read
function computeReadAndWrites(
    animation: BindAnimation,
    data: AnimationData,
    reference: AnimationData,
    dataCreated: boolean
) {
    animation._reads = [data]
    animation._writes = dataCreated ? [reference, data] : [reference]
}

export function bindAnimation(
    identifier: string,
    existingMemorySpecifier: Accessor[] = null,
    options: AnimationOptions = {}
): BindAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'BindAnimation',

        baseDuration: 20,
        name: `Bind Variable (${identifier}), with data at ${accessorsToString(
            existingMemorySpecifier ?? []
        )}`,

        // Attributes
        identifier,
        existingMemorySpecifier,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
