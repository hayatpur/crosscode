import { PrototypicalDataState } from '../../../environment/data/DataState'
import {
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

export interface ConsumeDataAnimation extends AnimationNode {
    register: Accessor[]
}

function onBegin(
    animation: ConsumeDataAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view

    // Get data
    const data = resolvePath(
        environment,
        animation.register,
        `${animation.id}_Property`,
        null,
        { noResolvingReference: true }
    ) as PrototypicalDataState

    const dataLocation = getMemoryLocation(environment, data).foundLocation

    // Consume data
    removeAt(environment, dataLocation)

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: dataLocation,
            id: data.id,
        })
    }
}

function onSeek(
    animation: ConsumeDataAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: ConsumeDataAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(
    animation: ConsumeDataAnimation,
    data: AnimationData
) {
    animation._reads = []
    animation._writes = [data]
}

export function consumeDataAnimation(
    register: Accessor[],
    options: AnimationOptions = {}
): ConsumeDataAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'ConsumeDataAnimation',

        name: 'ConsumeDataAnimation',

        // Attributes
        register,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
