import { createScope } from '../../../environment/environment'
import { PrototypicalEnvironmentState } from '../../../environment/EnvironmentState'
import { ScopeType } from '../../../transpiler/Statements/BlockStatement'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export interface CreateScopeAnimation extends ExecutionNode {
    type: ScopeType
}

function apply(animation: CreateScopeAnimation, environment: PrototypicalEnvironmentState) {
    createScope(environment, animation.type)

    computeReadAndWrites(animation)
}

function computeReadAndWrites(animation: CreateScopeAnimation) {
    animation._reads = []
    animation._writes = []
}

export function createScopeAnimation(type: ScopeType = ScopeType.Default): CreateScopeAnimation {
    return {
        ...createExecutionNode(null),
        _name: 'CreateScopeAnimation',

        name: 'CreateScopeAnimation',

        type,

        // Callbacks
        apply,
    }
}
