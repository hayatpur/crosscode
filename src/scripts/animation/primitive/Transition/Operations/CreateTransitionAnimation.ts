import { resolvePath } from '../../../../environment/environment'
import { AccessorType } from '../../../../environment/EnvironmentState'
import {
    addPrototypicalPath,
    beginPrototypicalPath,
    endPrototypicalPath,
    lookupPrototypicalPathById,
    removePrototypicalPath,
    seekPrototypicalPath,
} from '../../../../path/path'
import {
    createPrototypicalCreatePath,
    PrototypicalCreatePath,
} from '../../../../path/prototypical/PrototypicalCreatePath'
import { RootViewState } from '../../../../view/ViewState'
import { duration } from '../../../animation'
import { TransitionAnimationNode } from '../../../graph/abstraction/Transition'
import { AnimationData, AnimationRuntimeOptions } from '../../../graph/AnimationGraph'
import { AnimationOptions, createAnimationNode } from '../../AnimationNode'

export interface TransitionCreate extends TransitionAnimationNode {}

function onBegin(animation: TransitionCreate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const create = createPrototypicalCreatePath(
        [{ type: AccessorType.ID, value: animation.output.id }],
        [{ type: AccessorType.ID, value: animation.output.id }],
        `Create${animation.id}`
    )
    addPrototypicalPath(environment, create)
    beginPrototypicalPath(create, environment)
}

function onSeek(animation: TransitionCreate, view: RootViewState, time: number, options: AnimationRuntimeOptions) {
    let t = animation.ease(time / duration(animation))
    const environment = view.environment

    const create = lookupPrototypicalPathById(environment, `Create${animation.id}`) as PrototypicalCreatePath
    seekPrototypicalPath(create, environment, t)
}

function onEnd(animation: TransitionCreate, view: RootViewState, options: AnimationRuntimeOptions) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)

    const create = lookupPrototypicalPathById(environment, `Create${animation.id}`) as PrototypicalCreatePath
    endPrototypicalPath(create, environment)
    removePrototypicalPath(environment, `Create${animation.id}`)
}

function applyInvariant(animation: TransitionCreate, view: RootViewState) {
    const environment = view.environment
    const data = resolvePath(environment, [{ type: AccessorType.ID, value: animation.output.id }], null)
}

export function transitionCreate(
    output: AnimationData,
    origins: AnimationData[],
    options: AnimationOptions = {}
): TransitionCreate {
    return {
        ...createAnimationNode(null, { ...options }),

        name: 'TransitionCreate',

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
