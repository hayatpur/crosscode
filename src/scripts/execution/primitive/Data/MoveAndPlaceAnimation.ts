import { replacePrototypicalDataWith } from '../../../environment/data/data'
import {
    instanceOfPrototypicalData,
    PrototypicalDataState,
} from '../../../environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    instanceOfPrototypicalEnvironment,
    PrototypicalEnvironmentState,
} from '../../../environment/EnvironmentState'
import { DataInfo } from '../../graph/ExecutionGraph'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

/**
 * Move and place animation or just place if the from
 * is not defined.
 */
export interface MoveAndPlaceAnimation extends ExecutionNode {
    inputSpecifier: Accessor[]
    outputSpecifier: Accessor[]
}

function apply(animation: MoveAndPlaceAnimation, environment: PrototypicalEnvironmentState) {
    const from = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as PrototypicalDataState

    const to = resolvePath(
        environment,
        animation.outputSpecifier,
        `${animation.id}_To(${accessorsToString(animation.outputSpecifier)})`
    )

    const fromData = {
        location: getMemoryLocation(environment, from).foundLocation,
        id: from.id,
    }

    if (instanceOfPrototypicalEnvironment(to)) {
        computeReadAndWrites(animation, fromData, null)
    } else {
        computeReadAndWrites(animation, fromData, {
            location: getMemoryLocation(environment, to).foundLocation,
            id: to.id,
        })
    }

    if (instanceOfPrototypicalData(to)) {
        removeAt(environment, getMemoryLocation(environment, from).foundLocation)
        replacePrototypicalDataWith(to, from, { frame: true, id: true })
    }
}

function computeReadAndWrites(
    animation: MoveAndPlaceAnimation,
    inputData: DataInfo,
    outputData: DataInfo
) {
    animation._reads = [inputData]
    animation._writes = outputData ? [outputData, inputData] : [inputData]
}

export function moveAndPlaceAnimation(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[]
): MoveAndPlaceAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'MoveAndPlaceAnimation',

        name: `Move data at ${accessorsToString(inputSpecifier)} onto ${accessorsToString(
            outputSpecifier
        )}`,

        // Attributes
        inputSpecifier,
        outputSpecifier,

        // Callbacks
        apply,
    }
}
