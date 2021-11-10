import { DataState } from '../../../environment/data/DataState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { clone } from '../../../utilities/objects'
import { findEnvironmentById } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode, ReturnData } from '../AnimationNode'

export interface ReturnStatementAnimation extends AnimationNode {
    returnData: ReturnData
}

function onBegin(animation: ReturnStatementAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = findEnvironmentById(view, animation.returnData.environmentId)

    const data = resolvePath(environment, animation.returnData.register, `${animation.id}_Data`) as DataState
    data.frame = animation.returnData.frame

    console.log('I AM RETURNING!', clone(environment))

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: getMemoryLocation(environment, data).foundLocation,
            id: data.id,
        })
    }
}

function onSeek(animation: ReturnStatementAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: ReturnStatementAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

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
