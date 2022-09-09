import { createScope } from '../../../environment/environment'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { ScopeType } from '../../../transpiler/Statements/BlockStatement'
import { createExecutionNode, ExecutionNode } from '../ExecutionNode'

export type CreateScopeAnimation = ExecutionNode & {
    type: ScopeType
}

function apply(animation: CreateScopeAnimation, environment: EnvironmentState) {
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
