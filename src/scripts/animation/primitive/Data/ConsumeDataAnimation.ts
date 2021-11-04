import { DataState } from '../../../environment/data/DataState'
import { getMemoryLocation, removeAt, resolvePath } from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationData, AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface ConsumeDataAnimation extends AnimationNode {
    register: Accessor[]
}

function onBegin(animation: ConsumeDataAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)

    // Get data
    const data = resolvePath(environment, animation.register, `${animation.id}_Property`) as DataState
    const dataLocation = getMemoryLocation(environment, data).foundLocation

    // Consume data
    removeAt(environment, getMemoryLocation(environment, data).foundLocation)

    if (options.baking) {
        computeReadAndWrites(animation, {
            location: dataLocation,
            id: data.id,
        })
    }
}

function onSeek(animation: ConsumeDataAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: ConsumeDataAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: ConsumeDataAnimation, data: AnimationData) {
    animation._reads = []
    animation._writes = [data]
}

export function consumeDataAnimation(register: Accessor[], options: AnimationOptions = {}): ConsumeDataAnimation {
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
