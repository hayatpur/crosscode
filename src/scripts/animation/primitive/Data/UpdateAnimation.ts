import * as ESTree from 'estree'
import { PrototypicalDataState } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import { Accessor } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface UpdateAnimation extends AnimationNode {
    dataSpecifier: Accessor[]
    operator: ESTree.UpdateOperator
}

function onBegin(animation: UpdateAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, animation.dataSpecifier, `${animation.id}_Data`) as PrototypicalDataState

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
}

function onSeek(animation: UpdateAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: UpdateAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

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
