import { createScope } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { ScopeType } from '../../../transpiler/Statements/BlockStatement'
import { AnimationRuntimeOptions } from '../../graph/AnimationGraph'
import {
    AnimationNode,
    AnimationOptions,
    createAnimationNode,
} from '../AnimationNode'

export interface CreateScopeAnimation extends AnimationNode {
    type: ScopeType
}

function onBegin(
    animation: CreateScopeAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {
    const environment = view
    createScope(environment, animation.type)

    if (options.baking) {
        computeReadAndWrites(animation)
    }
}

function onSeek(
    animation: CreateScopeAnimation,
    view: PrototypicalEnvironmentState,
    time: number,
    options: AnimationRuntimeOptions
) {}

function onEnd(
    animation: CreateScopeAnimation,
    view: PrototypicalEnvironmentState,
    options: AnimationRuntimeOptions
) {}

function computeReadAndWrites(animation: CreateScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function createScopeAnimation(
    type: ScopeType = ScopeType.Default,
    options: AnimationOptions = {}
): CreateScopeAnimation {
    return {
        ...createAnimationNode(null, options),
        _name: 'CreateScopeAnimation',

        name: 'CreateScopeAnimation',

        type,

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
