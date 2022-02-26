import { replaceDataWith } from '../../../environment/data/data'
import { DataState, instanceOfData } from '../../../environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import {
    Accessor,
    accessorsToString,
    EnvironmentState,
    instanceOfEnvironment,
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

function apply(animation: MoveAndPlaceAnimation, environment: EnvironmentState) {
    const from = resolvePath(environment, animation.inputSpecifier, null, null, {
        noResolvingReference: true,
    }) as DataState

    const to = resolvePath(
        environment,
        animation.outputSpecifier,
        `${animation.id}_To(${accessorsToString(animation.outputSpecifier)})`
    )

    const fromData = {
        location: getMemoryLocation(environment, from).foundLocation,
        id: from.id,
    }

    if (instanceOfEnvironment(to)) {
        computeReadAndWrites(animation, fromData, null)
    } else {
        computeReadAndWrites(animation, fromData, {
            location: getMemoryLocation(environment, to).foundLocation,
            id: to.id,
        })
    }

    if (instanceOfData(to)) {
        removeAt(environment, getMemoryLocation(environment, from).foundLocation)
        replaceDataWith(to, from, { frame: true, id: true })
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
