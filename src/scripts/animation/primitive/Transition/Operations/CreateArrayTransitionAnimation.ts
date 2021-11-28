import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../environment/data/path/path'
import {
    createPrototypicalCreatePath,
    PrototypicalCreatePath,
} from '../../../../environment/data/path/primitives/PrototypicalCreatePath'
import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import { RootViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreateArray extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreateArray, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const create = createPrototypicalCreatePath(
        [{ type: AccessorType.ID, value: animation.output.id }],
        [{ type: AccessorType.ID, value: animation.output.id }],
        `CreateArray${animation.id}`
    )
    addPrototypicalPath(environment, create)
    beginPrototypicalPath(create, environment)
}

function onSeek(animation: TransitionCreateArray, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))
    const environment = view.environment

    const create = lookupPrototypicalPathById(environment, `CreateArray${animation.id}`) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreateArray, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)

    const create = lookupPrototypicalPathById(environment, `CreateArray${animation.id}`) as PrototypicalCreatePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `CreateArray${animation.id}`)
}

function applyInvariant(animation: TransitionCreateArray, view: RootViewState) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
}

export function transitionCreateArray(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreateArray {
    return {
        ...createAnimationNode(null, { ...options }),

        name: 'TransitionCreateArray',

        output,
        origins,

        // Callbacks
        onBegin,
        onSeek,
        onEnd,

        // Transition
        applyInvariant,
    }
}
