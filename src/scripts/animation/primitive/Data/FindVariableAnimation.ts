import { createData, replaceDataWith } from '../../../environment/data/data'
import { DataState, DataType } from '../../../environment/data/DataState'
import { resolvePath } from '../../../environment/environment'
import { Accessor, AccessorType } from '../../../environment/EnvironmentState'
import { RootViewState } from '../../../view/ViewState'
import { duration } from '../../animation'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface FindVariableAnimation extends AnimationNode {
    identifier: string
    outputRegister: Accessor[]
}

function onBegin(animation: FindVariableAnimation, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment

    const reference = resolvePath(
        environment,
        [{ type: AccessorType.Symbol, value: animation.identifier }],
        null,
        null,
        { noResolvingReference: true }
    )

    // Put it in the floating stack
    const register = resolvePath(environment, animation.outputRegister, `${animation.id}_FloatingRegister`) as DataState

    replaceDataWith(register, createData(DataType.ID, reference.id, `${animation.id}_Floating`))

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(animation: FindVariableAnimation, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))
}

function onEnd(animation: FindVariableAnimation, view: RootViewState, options: AnimationRuntimeOptions) {}

/**
 * TODO
 * @param animation
 * @param input
 */
function computeReadAndWrites(animation: FindVariableAnimation) {
    animation._reads = []
    animation._writes = []
}

export function findVariableAnimation(
    identifier: string,
    outputRegister: Accessor[],
    options: AnimationOptions = {}
): FindVariableAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'FindVariableAnimation',

        name: `Locating ${identifier}`,

        // Attributes
        identifier,
        outputRegister,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}
