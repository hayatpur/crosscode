import * as ESTree from 'estree'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import {
    getMemoryLocation,
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

export interface UpdateAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
    operator: ESTree.UpdateOperator
}

function onBegin(
    animation: UpdateAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    const data = resolvePath(
        environment,
        animation.dataSpecifier,
        `${animation.id}_Data`
    ) as PrototypicalDataState

    switch (animation.operator) {
        case '++':
            data.value = (data.value as number) + 1
            break
        case '--':
            data.value = (data.value as number) - 1
            break
        default:
            console.warn('Unrecognized update operator', animation.operator)
    }

    if (options.baking) {
        computeReadAndWrites(animation, {
            id: data.id,
            location: getMemoryLocation(environment, data).foundLocation,
        })
    }
}

function onSeek(
    animation: UpdateAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: UpdateAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(animation: UpdateAnimation, data: AnimationData) {
    animation._reads = [data]
    animation._writes = [data]
}

export function updateAnimation(
    dataSpecifier: Accessor[],
    operator: ESTree.UpdateOperator,
    options: AnimationOptions = {}
): UpdateAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'UpdateAnimation',

        name: 'UpdateAnimation',

        // Attributes
        dataSpecifier,
        operator,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
