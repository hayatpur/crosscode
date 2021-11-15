import { PrototypicalDataState } from '../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { RootViewState } from '../../../view/ViewState'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode, ReturnData } from '../AnimationNode'

export interface ReturnStatementAnimation extends AnimationNode {
    returnData: ReturnData
}

function onBegin(animation: ReturnStatementAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    const data = resolvePath(
        environment,
        animation.returnData.register,
        `${animation.id}_Data`
    ) as PrototypicalDataState
    data.frame = animation.returnData.frame

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: getMemoryLocation(environment, data).foundLocation,
            id: data.id,
        })
    }
}

function onSeek(
    animation: ReturnStatementAnimation,
    view: RootViewState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(animation: ReturnStatementAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: ReturnStatementAnimation, data: AnimationData) {
    animation._reads = [data]
    animation._writes = []
}

export function returnStatementAnimation(
    returnData: ReturnData,
    options: AnimationOptions = {}
): ReturnStatementAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'ReturnStatementAnimation',

        name: 'Return Statement',

        returnData,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
