import { createScope } from '../../../environment/environment'
import { getCurrentEnvironment } from '../../../view/view'
import { ViewState } from '../../../view/ViewState'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import { AnimationNode, AnimationOptions, createAnimationNode } from '../AnimationNode'

export interface CreateScopeAnimation extends AnimationNode {}

function onBegin(animation: CreateScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {
    const environment = getCurrentEnvironment(view)
    createScope(environment)

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(animation: CreateScopeAnimation, view: ViewState, time: number, options: AnimationRuntimeOptions) {}

function onEnd(animation: CreateScopeAnimation, view: ViewState, options: AnimationRuntimeOptions) {}

function computeReadAndWrites(animation: CreateScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function createScopeAnimation(options: AnimationOptions = {}): CreateScopeAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'CreateScopeAnimation',

        name: 'CreateScopeAnimation',

        // Callbacks
        onBegin,
        onSeek,
        onEnd,
    }
}

// function begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//     environment.createScope();

//     if (options.baking) {
//         super.computeReadAndWrites();
//     }
// }

// export function createScopeAnimation(node: Node, options: node = {}) {
//     return {
//         ...createAnimationNode(node, options),

//         begin: (
//             environment: Environment,
//             options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
//         ) => {
//             environment.createScope();

//             // if (options.baking) {
//             //     super.computeReadAndWrites();
//             // }
//         },
//     };
//     const base = createAnimationNode(node);
// }

// export class CreateScopeAnimation extends AnimationNode {
//     constructor(options: AnimationOptions = {}) {
//         super({ ...options });
//     }

//     begin(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
//         super.begin(environment, options);
//         environment.createScope();

//         if (options.baking) {
//             super.computeReadAndWrites();
//         }
//     }

//     seek(environment: Environment, time: number) {}

//     end(environment: Environment, options: AnimationRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {}
// }
